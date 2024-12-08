// eslint-disable-next-line no-unused-vars
import React from 'react';
import NavLinks from './NavLinks';
import '../styles/menu.css';
import logo from '../assets/logo.png';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { memoize } from 'proxy-memoize';
import { Button } from '@mui/material';
import { toggleMenu } from '../redux/actions/menuActions';
import { logoutUser } from '../redux/actions/userActions';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';

function Menu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mobile = useSelector(memoize((state) => state.menuState.mobile));
  const mobileMode = () => {
    dispatch(toggleMenu(!mobile));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.clear();
    return navigate('/login');
  };

  const user = getUserFromLocalStorage();

  return (
    <div className='flex flex-col gap-10 justify-between items-center py-2 w-full'>
      <div className='flex flex-col gap-10 justify-center items-start pt-5'>
        <div className='flex flex-col justify-center items-center w-full header'>
          <div className='w-full hamburgerMenu max-md:flex max-md:w-full max-md:flex-row max-md:items-center max-md:justify-center md:hidden' onClick={mobileMode}>
            <img src='/img/icons8-menu-24 (1).png' alt='' />
          </div>
          <div className='flex flex-row justify-center items-center w-full max-h-14'>
            <div style={{maxHeight: "100px"}}>
              <img className='mx-auto w-[12vw] max-sm:w-[43vw]' src={logo} alt='logo' />
            </div>
          </div>
        </div>
        <div className='flex'>
          <ul className='gap-4 pt-11 items'>
            <NavLinks />
          </ul>
        </div>
      </div>
      <div className='flex flex-col gap-4 justify-center items-center pt-3 pb-5 w-full'>
        <div className='flex text-center text-blue-900 capitalize p-auto'>
          {user?.role === "superAdmin" ?  "All locations" : user?.locations?.name}
        </div>
        <div className='flex w-full md:pl-2'>
          <div className="listItem">
            <Button className='text-white bg-primary' onClick={handleLogout}>
              logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
