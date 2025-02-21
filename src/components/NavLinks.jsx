// eslint-disable-next-line no-unused-vars
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/menu.css';
import { useSelector } from 'react-redux';
import { memoize } from 'proxy-memoize';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

// eslint-disable-next-line react-refresh/only-export-components

const NavLinks = () => {
  const user = useSelector(memoize((state) => state.userState.user));
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;
  let links = [
    {
      id: 1,
      url: `${['admin', 'superAdmin'].includes(currentUser.role)
        ? '/admin'
        : `/${currentUser.role}`
        }`,
      text: 'Dashboard',
    },
    { id: 2, url: 'models', text: 'Facility Sections' },
    { id: 3, url: 'users', text: 'Users' },
    { id: 4, url: 'location', text: 'Facility' },
    // { id: 5, url: 'form-features', text: 'Form Features' },
    { id: 6, url: 'report', text: 'Report' },
    { id: 7, url: 'trash', text: 'Recycle Bin' },
  ];

  if (currentUser.role !== "superAdmin") {
    // remove users and location links as only superAdmin can have access to those
    links = links.filter(link => !["users", "location"].includes(link.url))
  }

  return (
    <TooltipProvider>
      {links.map((link, index) => {
        const { url, text } = link;
        return (
          <li key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink 
                  className='listItem overflow-hidden text-ellipsis truncate max-w-[150px] block' 
                  activeclassname='active' 
                  end 
                  to={url}
                >
                  {text}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent>
                <p>{text}</p>
              </TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </TooltipProvider>
  );
};

export default NavLinks;
