/* eslint-disable no-unused-vars */

import '../index.css';
import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigation } from 'react-router-dom';
import { Loading } from '../components';
import '../styles/AdminLayout.css';
import { useSelector } from 'react-redux';
import HeaderTwo from '../components/HeaderTwo';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';

function ReviewersLayout() {
  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';
  const currentUser = localUser || user;
  if (!user && !localUser) {
    return <Navigate to='/login' replace />;
  }
  if (currentUser.role !== 'reviewer') {
    return (
      localStorage.removeItem('user'), (<Navigate to='/unauthorized' replace />)
    );
  }
  return (
    <div className='box-border flex relative flex-row justify-start items-start w-screen h-screen'>
      <div className='flex relative flex-col flex-grow justify-start items-center w-screen h-screen bg-white md:overflow-y-auto'>
        <HeaderTwo className="border-slate-300 bg-slate-300" style={{ height: '100px' }} />
        <div className='flex flex-grow justify-center items-start pt-10 w-full'>
          {isPageLoading ? <Loading /> : <Outlet />}
        </div>
      </div>
    </div>
  );
}

export default ReviewersLayout;
