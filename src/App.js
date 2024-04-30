import React, { useEffect, useRef, useState } from 'react'
import './Login.css'
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import axios from 'axios';
import { Discuss, Blocks } from 'react-loader-spinner';
import Snackbar from '@mui/material/Snackbar';
import { Alert, Button } from '@mui/material';
import { TextField, Slider, Typography, Box } from '@mui/material';
import { IoSettingsOutline } from "react-icons/io5";

// Validation schema
const schema = Yup.object().shape({
  // email: Yup.string().email('Must be a valid email').required('Email is required'),
  // password: Yup.string().required('Password is required'),
  userMsg: Yup.string().required('Message is required')
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [emailHasBlurred, setEmailHasBlurred] = useState(null)
  const [passwordHasBlurred, setPasswordHasBlurred] = useState(null)
  const [resError, setResError] = useState(false)
  const [reply, setReply] = useState('')
  const [threadId, setThreadId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reset, setReset] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef()
  const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  const allValues = watch();
  const onSubmit = async (data) => {
    data = {...data, threadId: threadId}
    setLoading(true)
    const backendUrl = 'https://93bll7e8xa.execute-api.eu-west-2.amazonaws.com/dev/'
    const url = backendUrl + 'api/process_message_with_ai/'
    axios.post(url, data, {headers: {"Content-Type": "multipart/form-data"}})
    .then(res => {
      setReply(res.data.reply)
      setThreadId(res.data.threadId)
    }).catch((err) => {
      setResError(true)
    }).finally(() => setLoading(false))
  }
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

const checkEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email)

}

const checkPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
  return regex.test(password)
}

useEffect(() => {
  if (reset) {
    setReply('')
    setThreadId('')
  }
}, [reset])

useEffect(() => {
  function handleClickOutside(event) {
      // If the menu is open and the click is outside the menu, close the menu
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSettingsOpen(false)
      }
  }

  // Add the event listener to the document
  document.addEventListener('mousedown', handleClickOutside);

  // Step 3: Cleanup the event listener
  return () => {
      document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

useEffect(() => {
  if (threadId === '' && reset) {
    setReset(false)
    handleSubmit(onSubmit)()
  }
}, [threadId])

  const handleInputValidation = (value, inputName) =>  {
    if (inputName === 'email') {
      setEmailHasBlurred(true)
      if (!checkEmail(value)) {
        setError(inputName, {
          type: 'manual',
          message: 'Please enter a valid email'
        })
        return false
      }
      else {
        clearErrors(inputName)
        return true
      }
    }
    else if (inputName === 'password') {
      setPasswordHasBlurred(true)
      // if (!checkPassword(value)) {
      //   setError(inputName, {
      //     type: 'manual',
      //     message: 'Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a special character and a number'
      //   })
      //   return false
      // }
      // else {
      //   clearErrors(inputName)
      //   return true
      // }
      if (value) return true
      else setError('password', {type: 'manual', message: 'Password is required'})
    }
    return false
  }

  return (
    <div className={'container'}>
      <div style={{position: 'absolute', top: '20px', right: '20px', cursor: 'pointer'}}>
      <IoSettingsOutline size={32} onClick={()=> setSettingsOpen(true)}/>
      </div>
      <div ref={menuRef}
        style={{
          transition:'all 0.5s',
          display: 'none',
          position: 'absolute', 
          right: settingsOpen ? '0' : '-300px', 
          top:'50%', 
          transform: 'translateY(-50%)', 
          height: '100%', 
          backgroundColor:'rgb(255 144 144)', 
          width: '300px',
          zIndex: '1',
          display: 'flex',
          flexDirection: 'column',
          color: '#fff'
        }}>
        <h1 style={{textAlign: 'center'}}>Assistant Settings</h1>
        <FormWithSlider close={() => setSettingsOpen(false)}/>
      </div>
      <div className={'registerDiv'}>
        <h1 className={'header'}>AI Message Reply</h1>
        <h2 className={'subHeader'}>Enter a message and get an AI reply</h2>
        <div className={'formDiv'}>
          <form id={'registerForm'} onSubmit={handleSubmit(onSubmit)}>
            <div className={'emailContainer'}>
              <label className={'label'}>Message:</label>
              {/* <input 
                className={`${'input'} ${!!errors.email ? 'inputError' : emailHasBlurred !== null && 'inputSuccess'}`}
                type="email" {...register('email')}
                placeholder='Enter your Email'
                onBlur={(e) => handleInputValidation(e.target.value, 'email')}
                // onChange={(e) => setEmail(e.target.value.value)}
              />
              {errors.email && <p className={'errorText'}>{errors.email.message}</p>} */}
              <textarea 
                style={{height:'auto', width: 'unset', margin: '0', padding: '10px'}}
                className={`${'input'} ${!!errors.email ? 'inputError' : emailHasBlurred !== null && 'inputSuccess'}`}
                 {...register('userMsg')}
                placeholder='Enter your Message'
                // onBlur={(e) => handleInputValidation(e.target.value, 'email')}
                // onChange={(e) => setEmail(e.target.value.value)}
              />
              {errors.userMsg && <p className={'errorText'}>{errors.userMsg.message}</p>}
            </div>
            <div className={'passwordContainer'}>
              <label className={'label'}>Reply:</label>
              <div style={{position: 'relative', width: '100%'}}>
                {/* <input 
                  className={`${'input'} ${!!errors.password ? 'inputError' : passwordHasBlurred !== null && 'inputSuccess'}`}
                  type={!showPassword ? "password" : "text"}
                  {...register('password')}
                  placeholder='Enter your Password'
                  onBlur={(e) => handleInputValidation(e.target.value, 'password')}
                  onChange={(e) => setPassword(e.target.value.value)}
                />
                <div className={'endIconContainer'} onClick={toggleShowPassword}>
                    {!showPassword ? <FaRegEyeSlash className={'endIcon'} size={20}/> : <FaRegEye className={'endIcon'} size={20}/>}
                </div>
                {errors.password && <p className={'errorText'}>{errors.password.message}</p>} */}
                <div style={{backgroundColor: 'white', minHeight: '100px', maxHeight: '300px', overflowY: 'scroll', display: 'flex'}}>
                  {!loading ? <p style={{margin: '0', padding: '10px'}}>
                    {reply}
                  </p> 
                  :<>
                    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: '-5px'}}>
                      <Discuss
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="discuss-loading"
                        wrapperStyle={{}}
                        wrapperClass="discuss-wrapper"
                        color="#fff"
                        backgroundColor="#F4442E"
                        />
                    </div>
                    <p 
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        margin: '35px 0 0 0'
                      }}
                        >Generating...</p>
                  </>}
                </div>
              </div>
            </div>
            <div className={'btnContainer'}>
              <button className={'btn'} type="submit">{reply ? 'Send Follow-up' :'Send'}</button>
              {reply && <button className={'btn'} onClick={(e) => {
                e.preventDefault()
                setReset(true)
              }}>Send as New Message</button>}
            </div>
              {/* {resError && <p style={{textAlign: 'center'}} className={'errorText'}>{resError}</p>} */}
          </form>
        </div>
      </div>
      {/* <div className={'bottomTextContainer'}>
        <p>Not yet apart of the Rize? <span onClick={() => window.location.assign('/register')}>Register</span></p>
      </div> */}
      <Snackbar open={resError} autoHideDuration={6000} anchorOrigin={{horizontal: 'center', vertical: 'bottom'}} onClose={() => setResError(false)}>
        <Alert
          onClose={() => setResError(false)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Error. Please try again
        </Alert>
      </Snackbar>
    </div>
  )
}

const FormWithSlider = ({close}) => {
  const [sliderValue, setSliderValue] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(false)

  const handleSliderChange = (event, newValue) => {
      setSliderValue(parseFloat(newValue));
  };

  const handleInputChange = (event) => {
      setInputValue(event.target.value);
  };

  const handleUpdateAISettings = () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('instructions', inputValue)
    formData.append('temperature', sliderValue)
    const backendUrl = 'https://93bll7e8xa.execute-api.eu-west-2.amazonaws.com/dev/'
    const url = backendUrl + 'api/updateAssistantSettings/'
    axios.post(url, formData, {headers: {"Content-Type": "multipart/form-data"}})
    .then(res => {
      setSeverity('success')
    })
    .catch(err => {
      setSeverity('error')
    })
    .finally(() => {
      setLoading(false)
    })
  }

  return (
      <Box sx={{ width: '100%', margin: '0', padding: '40px 10px 0',  }}>
          <TextField
              multiline
              fullWidth
              label="AI instructions"
              value={inputValue}
              onChange={handleInputChange}
              margin="normal"
          />
          <Typography marginTop={'20px'} gutterBottom>
              AI Temperature (Randomness): {sliderValue}
          </Typography>
          <Slider
              value={sliderValue}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
              step={0.1}
              marks
              min={0}
              max={2}
              valueLabelDisplay="auto"
          />
          <div style={{width: '100%', display:'flex', justifyContent:'center', alignItems: 'center', paddingTop: '20px'}}>
          {!loading ? 
          <>
            <Button onClick={handleUpdateAISettings}>Update</Button>
            <Button onClick={() => close()}>Cancel</Button>
          </> :
            <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems: 'center'}}>
              <Blocks
                height="80"
                width="80"
                color="#4fa94d"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                visible={loading}
                />
                Updating...

            </div>
          }
          </div>
          <Snackbar open={!!severity} autoHideDuration={6000} anchorOrigin={{horizontal: 'center', vertical: 'bottom'}} onClose={() => setSeverity('')} style={{width: '250px'}}>
            <Alert
              onClose={() => setSeverity('')}
              severity={severity}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {severity === 'success' ? 'Successfully updated settings' : 'Error. Please try again'}
            </Alert>
          </Snackbar>
      </Box>
  );
}

export default Login