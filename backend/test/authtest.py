from flask import Flask, redirect, url_for, session, request, render_template_string
import boto3
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Cognito configuration
COGNITO_REGION = 'us-west-2'
USER_POOL_ID = 'us-west-2_qhPzQQqYA'
CLIENT_ID = 'jsb637fsid2puaed9mnavgsio'

cognito_client = boto3.client('cognito-idp', region_name=COGNITO_REGION)

LOGIN_PAGE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Login - Resume Enhancer</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
        input { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background: #0056b3; }
        .error { color: red; margin: 10px 0; }
        .tabs { display: flex; margin-bottom: 20px; }
        .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; border: 1px solid #ddd; }
        .tab.active { background: #007bff; color: white; }
    </style>
</head>
<body>
    <h2>Resume Enhancer</h2>
    
    <div class="tabs">
        <div class="tab active" onclick="showLogin()">Login</div>
        <div class="tab" onclick="showSignup()">Sign Up</div>
    </div>
    
    {% if error %}
    <div class="error">{{ error }}</div>
    {% endif %}
    
    <div id="loginForm">
        <form method="POST" action="/login">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
    
    <div id="signupForm" style="display:none;">
        <form method="POST" action="/signup">
            <input type="text" name="name" placeholder="Full Name" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password (min 8 chars)" required>
            <button type="submit">Sign Up</button>
        </form>
    </div>
    
    <script>
        function showLogin() {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('signupForm').style.display = 'none';
            document.querySelectorAll('.tab')[0].classList.add('active');
            document.querySelectorAll('.tab')[1].classList.remove('active');
        }
        function showSignup() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('signupForm').style.display = 'block';
            document.querySelectorAll('.tab')[0].classList.remove('active');
            document.querySelectorAll('.tab')[1].classList.add('active');
        }
    </script>
</body>
</html>
'''

CONFIRM_PAGE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Confirm Email</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
        input { width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
        .error { color: red; }
    </style>
</head>
<body>
    <h2>Confirm Your Email</h2>
    <p>We sent a verification code to {{ email }}</p>
    {% if error %}
    <div class="error">{{ error }}</div>
    {% endif %}
    <form method="POST" action="/confirm">
        <input type="hidden" name="email" value="{{ email }}">
        <input type="text" name="code" placeholder="Verification Code" required>
        <button type="submit">Confirm</button>
    </form>
</body>
</html>
'''

DASHBOARD_PAGE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .user-info { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        a { color: #007bff; }
    </style>
</head>
<body>
    <h2>Welcome, {{ user.name }}!</h2>
    <div class="user-info">
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Access Token:</strong> <code style="word-break:break-all;">{{ token[:50] }}...</code></p>
    </div>
    <p><a href="/logout">Logout</a></p>
</body>
</html>
'''

@app.route('/')
def index():
    if 'user' in session:
        return render_template_string(DASHBOARD_PAGE, user=session['user'], token=session.get('access_token', ''))
    return render_template_string(LOGIN_PAGE, error=None)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        try:
            response = cognito_client.initiate_auth(
                ClientId=CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password
                }
            )
            
            # Check if there's a challenge (e.g., NEW_PASSWORD_REQUIRED)
            if 'ChallengeName' in response:
                return render_template_string(LOGIN_PAGE, error=f"Challenge required: {response['ChallengeName']}")
            
            # Check if AuthenticationResult exists
            if 'AuthenticationResult' not in response:
                return render_template_string(LOGIN_PAGE, error='Authentication failed - no tokens returned')
            
            # Get user info
            access_token = response['AuthenticationResult']['AccessToken']
            user_response = cognito_client.get_user(AccessToken=access_token)
            
            user_attrs = {attr['Name']: attr['Value'] for attr in user_response['UserAttributes']}
            
            session['user'] = {
                'email': user_attrs.get('email', email),
                'name': user_attrs.get('name', 'User')
            }
            session['access_token'] = access_token
            session['id_token'] = response['AuthenticationResult']['IdToken']
            
            return redirect(url_for('index'))
            
        except cognito_client.exceptions.NotAuthorizedException as e:
            return render_template_string(LOGIN_PAGE, error=f'Auth error: {str(e)}')
        except cognito_client.exceptions.UserNotConfirmedException:
            return redirect(url_for('confirm', email=email))
        except KeyError as e:
            return render_template_string(LOGIN_PAGE, error=f'Missing key in response: {e}')
        except Exception as e:
            return render_template_string(LOGIN_PAGE, error=str(e))
    
    return render_template_string(LOGIN_PAGE, error=None)

@app.route('/signup', methods=['POST'])
def signup():
    name = request.form['name']
    email = request.form['email']
    password = request.form['password']
    
    try:
        cognito_client.sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'name', 'Value': name}
            ]
        )
        return redirect(url_for('confirm', email=email))
        
    except cognito_client.exceptions.UsernameExistsException:
        return render_template_string(LOGIN_PAGE, error='Email already registered')
    except Exception as e:
        return render_template_string(LOGIN_PAGE, error=str(e))

@app.route('/confirm', methods=['GET', 'POST'])
def confirm():
    email = request.args.get('email') or request.form.get('email')
    
    if request.method == 'POST':
        code = request.form['code']
        
        try:
            cognito_client.confirm_sign_up(
                ClientId=CLIENT_ID,
                Username=email,
                ConfirmationCode=code
            )
            return redirect(url_for('login'))
            
        except Exception as e:
            return render_template_string(CONFIRM_PAGE, email=email, error=str(e))
    
    return render_template_string(CONFIRM_PAGE, email=email, error=None)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3000, debug=True)