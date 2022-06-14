import React, { useState, useRef } from "react";
import Body from '../components/body';
import { CurrentUserContext } from '../hook/session';
import { UserType } from "../api/db/types";
import AuthChecker from "../hook/auth-checker";
import fetchParams from "../helpers/helperFetch";
import responseHandler from "../helpers/response-handler";
import { ChatSocketContext } from "../hook/chat-socket";

function FirstLogin(){
  const { value: currentUser, setCurrentUser } = React.useContext(CurrentUserContext)!;
  const authCtx = React.useContext(AuthChecker);
  const chatCtx = React.useContext(ChatSocketContext);
  const inputLoginRef = useRef();
  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState('');
  const [errors, setErrors] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState<Boolean>(true);
  const [avatar, setAvatar]= useState(currentUser!.avatar_path);
  const [controller, setController] = React.useState(new AbortController());

  async function check_logins(input_login : string){
    let test_login :boolean = false;
    if (input_login.length > 20 || input_login.length < 1){
      if (mounted === true)
        setErrors('wrong login size, must be <1 or >21')
      return test_login;
    }
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      await fetch("/api/users", {...params,
      signal: controller.signal
    })
      .then(response => responseHandler(response))
      .then(users => {
          let test = users.filter((user : UserType)  => {
            return user.login === input_login
          })
          if (test.length === 0){
            test_login = true;
            if (mounted === true)
              setErrors(null)
          }
          else {
            if (mounted === true)
              setErrors('login already taken, choose another')
            test_login = false;
          }
        }
      )
      .catch(_error => {})
    }
    return test_login;
  }

  async function modifyLogin(event){
    event.preventDefault();
    if (inputLoginRef === null || inputLoginRef.current === null || inputLoginRef.current.value === null)
      return ;
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const login : string = inputLoginRef.current.value;
    let test_login :boolean = await check_logins(login);

    const params = await fetchParams('PATCH', { login });
    if (test_login !== false && params !== null) {
      fetch("/api/user", {...params,
      signal: controller.signal
    })
      .then(response => {
        if (response.ok){
          responseHandler(response).then((data) => {
            if (mounted === true){
              setErrors(null);
              chatCtx.chatSocket.emit('majLoginsServer', { id_user: currentUser!.id });
              setCurrentUser(data);
            }
          })
        }
        else{
          if (mounted === true)
            setErrors('login already taken, choose another');
        }
      })
      .catch(_error => {});
    }
  }

  async function uploadToDB(avatar_path : string) {
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('PATCH', { avatar_path });
    if (params !== null) {
      return await fetch("/api/user", {...params,
      signal: controller.signal
    })
      .then(response => {
        if (response.ok){
          responseHandler(response).then((data) => {
            if (mounted === true){
              setCurrentUser(data);
              setCreateObjectURL(avatar_path);
			  setAvatar(avatar_path)
              setErrors(null);
              chatCtx.chatSocket.emit('majAvatarServer', { id_user: currentUser!.id });
            }
        })}
        else{
          if (mounted === true)
            setErrors('there is a problem with your avatar, choose another');
        }
      })
      .catch(error => {});
    }
  }
    
  async function check_avatar(body : FormData){
    let check :boolean = false;
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      try{
        const params2 = {
          method: "POST", 
          body 
        }
        await fetch("/avatar_api/check",{...params2,
          signal: controller.signal
        }).then(response => {
        if (response.ok) {
          check = true;
        }
        else
          throw(response)
      })
      }catch(error) {
        if (mounted === true)
          setErrors('there is a problem with your avatar, choose another')};
    }
    return check;
  }
    
  const uploadToServer = async (event : any) => {
    const body = new FormData();
	body.append("upload_preset", "avatar")
    body.append("file", image!);
	body.append("cloudName", "rolandgarong")
	body.append("sources", "[ 'local', 'url', 'image_search']")
	body.append("resourceType", "image")
	body.append("multiple", "false")
	body.append("maxImageFileSize" , "5000000")


    let check : boolean = await check_avatar(body);
    if (check === false){
      if (mounted === true)
        setErrors('there is a problem with your avatar, choose another');
      return ;
    }
    await authCtx.authCheck(localStorage.getItem("currentUser"));
    const params = await fetchParams('GET');
    if (params !== null) {
      const params2 = {
        method: "POST",
        body: body
      }
	  try {
      const res  = await fetch("https://api.cloudinary.com/v1_1/rolandgarong/image/upload", {...params2,
        signal: controller.signal
      })
	  if (res.status === 200){
			const resp = await res.json();
			let n_av = resp.secure_url;
			uploadToDB(n_av);
        }
        else{
          if (mounted === true)
            setErrors('there is a problem with your avatar, choose another');
		  }
		}
		catch(e){}
    }
  };

  const uploadToClient = (event : any) => {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].size < 1 || event.target.files[0].size > 5000000){
        if (mounted === true)
          setErrors('file too big, max 5Mb')
        return ;
      }
      const i = event.target.files[0];
      if (mounted === true){
        setImage(i);
        setCreateObjectURL(URL.createObjectURL(i));
		// setAvatar(createObjectURL);
      }
    }
  };

  React.useEffect(()=>{
    return () => {
      setMounted(false)
      controller?.abort()
    }
  }, []);

  return (
    <Body content={ 
    	<div className="first_log_layout">
        <div className="first_log_elem">
            <div className="avatar_change">
              {avatar && <img src={avatar || '/images/default_user.jpg'} width='100' height='100' />}
              <input type="file" name="myImage" accept="image/x-png, image/jpeg" onChange={uploadToClient} />
              <button
                className="btn btn-primary"
                type="submit"
                onClick={uploadToServer} 
              >
                Upload Avatar
              </button>
              {errors === 'there is a problem with your avatar, choose another' ? errors : <div></div>}
              {errors === 'file too big, max 5Mo' ? errors : <div></div>}
            </div>
            <div>
              <form onSubmit={modifyLogin}>
              <div>
                  <input
                    code='login'
                    id='login'
                    placeholder='New Login'
                    aria-label='New Login'
                    required minLength="1" maxLength="20"
                    ref={inputLoginRef}
                  />
                  <button>Enter new Login</button>
                </div>
              </form>
              {errors === 'login already taken, choose another' ? errors : <div></div>}
              {errors === 'wrong login size, must be <1 or >21' ? errors : <div></div>}
            </div>
            </div>
        </div>
      }
    />
  )
}
 
export default FirstLogin;
