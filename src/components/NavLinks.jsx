// eslint-disable-next-line no-unused-vars
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/menu.css';
import { useSelector } from 'react-redux';
import { memoize } from 'proxy-memoize';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';

// eslint-disable-next-line react-refresh/only-export-components

const NavLinks = () => {
  const user = useSelector(memoize((state) => state.userState.user));
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;
  const links = [
    {
      id: 1,
      url: `${
        ['admin', 'superAdmin'].includes(currentUser.role)
          ? '/admin'
          : `/${currentUser.role}`
      }`,
      text: 'Dashboard',
    },
    { id: 2, url: 'models', text: 'Facilities' },
    { id: 3, url: 'users', text: 'Users' },
    { id: 4, url: 'location', text: 'Locations' },
    { id: 5, url: 'form-features', text: 'Form Features' },
    { id: 6, url: 'report', text: 'Report' },
    { id: 7, url: 'trash', text: 'Recycle Bin' },
  ];

  return (
    <>
      {links.map((link, index) => {
        const { url, text } = link;
        return (
          <li key={index}>
            <NavLink className='listItem' activeclassname='active' end to={url}>
              {text}
            </NavLink>
          </li>
        );
      })}
    </>
  );
};

export default NavLinks;
