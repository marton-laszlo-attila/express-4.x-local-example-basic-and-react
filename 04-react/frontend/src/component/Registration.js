import { useHistory } from 'react-router-dom'

const Registration = () => {
  const history = useHistory();

  const handleSubmitForm = (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    fetch('/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error.status === 200) {
          history.push('/');
        } else {
          console.log(data.error.status + ' error: ' + data.error.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  return <>
    <h1>Registration</h1>
    <form onSubmit={handleSubmitForm}>
      <div>
        <label>Username:</label>
        <input type="text" name="username" id="username" /><br />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" id="password" />
      </div>
      <div>
        <input type="submit" value="Submit" />
      </div>
    </form>
  </>
}

export default Registration;