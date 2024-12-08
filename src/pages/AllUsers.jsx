// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../styles/AllUsers.css';
import { GoTrash } from 'react-icons/go';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { IoSearchSharp } from 'react-icons/io5';
import { useLoaderData } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { customFetch, getRealFileUrl } from '../utils';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { memoize } from 'proxy-memoize';

const url = '/user/getusers';

const userQuery = {
  queryKey: ['user'],
  queryFn: () => customFetch(url),
};

// eslint-disable-next-line react-refresh/only-export-components
export const loader = (queryClient) => async () => {
  const response = await queryClient.ensureQueryData(userQuery);
  const user = response?.data.users;
  if (response?.data.status === 'error') {
    toast.error(response?.data.message);
  }
  return { user };
};

const AllUsers = () => {
  const { user, isLoading } = useLoaderData();
  const authUser = useSelector(memoize((state) => state.userState.user));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [users, setUsers] = useState([]);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = useMemo(
    () => user.slice(itemOffset, endOffset),
    [endOffset, itemOffset, user]
  );
  const pageCount = Math.ceil(user.length / itemsPerPage);

  const handleFilterUsers = useCallback(
    (search) => {
      const regex = new RegExp(`.*${search.toLowerCase()}.*`, 'i');

      const searchResult = user.filter((item) => {
        return (
          regex.test(item.username.toLowerCase()) ||
          regex.test(item.fullname.toLowerCase()) ||
          regex.test(item.role.toLowerCase()) ||
          regex.test(item.email.toLowerCase())
        );
      });
      setUsers(searchResult);
    },
    [user, setUsers]
  );

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % user.length;
    setItemOffset(newOffset);
  };

  const fetchData = async () => {
    const response = await queryClient.ensureQueryData(userQuery);
    if (response.data.status !== 'error') {
      setUsers(response.data.users);
    } else {
      toast.error(response.data.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setUsers(currentItems);
  }, [currentItems]);

  const handleDelete = async (_id) => {
    try {
      const res = await customFetch.delete(`/user/delete/${_id}`);
      if (res.data?.status !== 'error') {
        setUsers(users.filter((user) => user._id !== _id));
        queryClient.invalidateQueries('user');
        toast.success('User deleted successfully');
      } else {
        toast.error(res.data?.message);
      }
    } catch (error) {
      const errorMessage = error?.res?.data?.msg || 'Error deleting user';
      toast.error(errorMessage);
    }
  };

  return (
    <div className='AllUsers h-[100%] py-5'>
      <main className='flex flex-col gap-10 justify-center items-center md:px-10'>
        <div className='flex flex-col gap-4 justify-center items-center w-full'>
          <div className='flex flex-row justify-end w-full'>
            {['admin', 'superAdmin'].includes(authUser.role) && (
              <Link to='add-user'>
                <Button className='btn btn-success btn-sm'>
                  <AddIcon />
                  <p>Add User</p>
                </Button>
              </Link>
            )}
          </div>
          <div className='mx-auto w-full searchBarContainer'>
            <div className='px-3 searchIconWrapper'>
              <IoSearchSharp className='img searchImg' color='#858585' />
            </div>
            <input
              className='flex flex-row flex-grow'
              type='text'
              placeholder='Search users'
              onChange={(e) => handleFilterUsers(e.target.value)}
            />
            <div className='filter'>
              <p>Search</p>
            </div>
          </div>
        </div>
        <div className='mt-5 AllUsersWrapper'>
          {isLoading ? (
            <div className='loader'>Loading users...</div>
          ) : users?.length > 0 ? (
            users?.map((item) => {
              const { username, role, _id, imageUrl } = item;
              return (
                <div
                  className='flex justify-between items-center p-2 my-3 rounded-lg border-2'
                  key={_id}>
                  <div className='flex gap-2 justify-center items-center'>
                    <img
                      src={`${getRealFileUrl(imageUrl || "") ??
                        'https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg'
                        }`}
                      alt=''
                      className='h-[50px] w-[50px] rounded-xl'
                    />
                    <div className='flex flex-col gap-2'>
                      <h1 className='font-semibold'>{username}</h1>
                      <p className='text-xs font-normal'>{role}</p>
                    </div>
                  </div>
                  <div className='flex gap-4 items-center'>
                    {['admin', 'superAdmin'].includes(authUser.role) && (
                      <button
                        className='btn btn-sm'
                        onClick={() =>
                          navigate(
                            `/${['admin', 'superAdmin'].includes(authUser.role)
                              ? 'admin'
                              : authUser.role
                            }/edit-user/${_id}`
                          )
                        }>
                        Edit
                      </button>
                    )}
                    <button
                      className='btn btn-sm'
                      onClick={() =>
                        navigate(
                          `/${['admin', 'superAdmin'].includes(authUser.role)
                            ? 'admin'
                            : authUser.role
                          }/single-user/${_id}`
                        )
                      }>
                      View
                    </button>
                    {['admin', 'superAdmin'].includes(authUser.role) && (
                      <GoTrash
                        className='w-5 h-5 cursor-pointer'
                        color='#ff8686'
                        onClick={() => handleDelete(_id)}
                      />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className='flex flex-col flex-grow justify-center items-center self-center h-full text-2xl min-h-96'>
              <div className='flex'>No user found</div>
            </div>
          )}
        </div>
        <div className='navigatonBtnContainer'>
          <ReactPaginate
            previousLabel='Prev'
            nextLabel='Next'
            pageClassName='flex h-10 w-10 items-center justify-center rounded-full text-center text-xl'
            pageLinkClassName='page-link'
            previousClassName='flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold'
            previousLinkClassName='page-link'
            nextClassName='flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold'
            nextLinkClassName='page-link'
            breakLabel='...'
            breakClassName='flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold'
            breakLinkClassName='page-link'
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName='flex flex-row items-center justify-center gap-2 py-10 text-center text-xl'
            activeclassname='active'
            forcePage={itemOffset}
          />
        </div>
      </main>
    </div>
  );
};

export default AllUsers;
