import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/Login.css';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { SubmitBtn } from '../components';
import png from '../assets/mask.png';
import { loginUser } from '../redux/actions/userActions';
import {
  getAccessTokenFromLocalStorage,
  getUserFromLocalStorage,
} from '../redux/reducers/userReducer';

const Login = () => {
  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const localAccessToken = getAccessTokenFromLocalStorage();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [reRouteUrl, setReRouteUrl] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = localUser || user;

  function reRouteByRole(role) {
    let rerouteUrl = "/"
    switch ((role || "").toLowerCase()) {
      case "superadmin":
      case "admin":
        rerouteUrl = "/admin"
        break
      case "sampler":
        rerouteUrl = "/sampler"
        break
      case "reviewer":
        rerouteUrl = "/reviewer"
        break
    }
    navigate(rerouteUrl)
  }

  useEffect(() => {
    // if (localUser?.role) {
    //   dispatch(
    //     loginUser({ data: { user: localUser, accessToken: localAccessToken } })
    //   );
    // }
    if (currentUser?.role) {
      reRouteByRole(currentUser.role)
    }
  }, [isLoggedin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await customFetch.post('/user/login', {
        email,
        password,
      });

      const userData = response.data.status !== 'error' ? response.data : null;
      if (response.data.status !== 'error') {
        dispatch(loginUser(userData));
        toast.success('logged in successfully');
        setIsLoggedin(true)
      } else {
        toast.error(`${response.data.message}`);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.msg || 'Wrong login details or Network error';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='h-screen LoginWrapper'>
      <form method='POST' className='Login' onSubmit={handleSubmit}>
        <div className='Wrapper'>
          <div className='background1'></div>
          <div className='h-screen background2'>
            <img src={png} className='h-screen' alt='' />
          </div>
        </div>
        <div className='loginContainer'>
          <div>
            <img
              className='mx-auto w-[15vw]  max-h-[130px] max-sm:w-[45vw]'
              src={logo}
              alt='logo'
            />
          </div>
          <h4 className='text-3xl font-bold text-center'>Welcome back</h4>
          <p className='mb-3 text-center font-[400]'>
            Welcome back! Please enter your details.
          </p>
          <div className='emailContainer'>
            <p>Email</p>
            <input
              type='text'
              placeholder='enter your email'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div className='passwordContainer'>
            <p>Password</p>
            <div className='flex'>
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder='enter your password'
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <div className='mr-5 passwordVisibleWrapper'>
                {passwordVisible ? (
                  <FaEyeSlash
                    className='cursor-pointer'
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  />
                ) : (
                  <FaEye
                    className='cursor-pointer'
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  />
                )}
              </div>
            </div>
          </div>
          <div className='infoContainer'>
            <div className='gap-1 rememberMe'>
              <input type='checkbox' name='remember' id='remember' />
              <label htmlFor='remem'>Remember me</label>
            </div>
            <Link to={'/reset-password'}>
              <p className='underline'>forgot password</p>
            </Link>
          </div>
          <div className='mt-5'>
            <SubmitBtn text='Sign in' isSubmitting={isSubmitting} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
