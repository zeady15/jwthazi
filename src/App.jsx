import { useState } from 'react'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './App.css'

export const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('')
  const [data, setData] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [login, setLogin] = useState(false);
  const [error, setError] = useState('');

  const sha256 = async(msg) =>{
    const msgBuff = new TextEncoder().encode(msg);
    const hashBuff = await crypto.subtle.digest('SHA-256', msgBuff);
    const hashArray = Array.from(new Uint8Array(hashBuff));
    return hashArray.map(b =>b.toString(16).padStart(2, '0')).join('');
  }

  const handleLogin = async () => {
    try {
      setError('');
      const saltRes = await axios.get(`https://localhost:7255/api/Login/GetSalt?username=${username}`);
      const salt = saltRes.data;
      console.log("Salt: ",salt);      
      const saltPass = password + salt;
      const hashPass = await sha256(saltPass);
       console.log("Salt password: ",saltPass);
      console.log("Hash: ",hashPass);
      const loginRes = await axios.post(`https://localhost:7255/api/Login/Login`, {
        loginName: username,
        hash: hashPass,
      });
      const receivedToken=loginRes.data;
      setToken(receivedToken);
      console.log("Token: ", receivedToken);
      setLogin(true);
      const decoded = jwtDecode(receivedToken);
      console.log("Dekódolt token: ", decoded);
      setTokenData(decoded);
    } catch (error) {
      console.error("Hitelesítés sikertelen: ",error);
      setError("Hálózati hiba");
    }
  };
  return (
      <div style={{padding: '28px' }}>
          {token ? (
        <div>
          <h1>Be van jelentkezve - Üdvözöljük!</h1>
          <div style={{ marginTop: '28px', border: '1px solid #ccc', padding: '15px'}}>
          <h2>A munkamenet adatai</h2>
          {tokenData ? (
            <>
            <p>Felhasználó: {tokenData.username}</p>
            <p>Lejárat: {tokenData.exp ? new Date(tokenData.exp*1000).toLocaleString('hu-HU') 
              : ("Nincs lejárat!")}</p>
            </>
          ) : (<p>Adatok betöltése <span className="spinner-border"></span></p>)}

        </div>
        <br />
        <button onClick={() =>{ setToken(''); setData(null);}}>Kijelentkezés</button>
        </div>
      ) : (
         <div><h1>Bejelentkezés</h1>
        Felhasználó: <input type="text"
        placeholder='felhasználónév'
        value={username}
        onChange={(event) => setUsername(event.target.value) } /> <br />
        Jelszó: <input type="password"
        placeholder='jelszó'
        value={password}
      onChange={(event) => setPassword(event.target.value) } /> <br />
      <button onClick={handleLogin}>Bejelentkezés</button>
      </div>
        )
        }
      </div>
  );
};
