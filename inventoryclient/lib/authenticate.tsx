import jwt_decode from "jwt-decode";

export function setToken(token) {
  if (typeof window !== 'undefined') {
    return (window.localStorage.setItem('access_token', token));
  }
}
  
export function getToken() {
  if (typeof window !== 'undefined') {
    return (window.localStorage.getItem('access_token'));
  }
  return (null);
}
  
export function readToken(){
    const token = getToken();
    return ((token) ? jwt_decode(token) : null);
}
  
export function isAuthenticated(){
    const token = readToken();  
    return ((token) ? true : false);
}
  
export function removeToken(){
  return window.localStorage.removeItem('access_token');

}

export async function authenticateUser(username, password, role = null) {
  
  let url = 'http://localhost:8080/';
  const body = {username, password, role};
  
  if (role) {
    url += 'register';
  
  } else {
    url += 'login';
  }

  const res = await fetch(url, {
    
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
  });
 
  const data = await res.json();
  if(res.status === 200){
      setToken(data.token);
      return { success: true, message: data.message, token: data.token};
  } else {
    return { success: false, message: data.message };
  } 
}