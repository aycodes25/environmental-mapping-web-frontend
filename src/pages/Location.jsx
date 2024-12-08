// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from 'react';
import { IoSearchSharp } from 'react-icons/io5';
import '../styles/AllUsers.css';
import AddLocation from './AddLocation';
import EditLocation from './EditLocation';
import { customFetch, getRealFileUrl as getRealFileUrl } from '../utils';
import { toast } from 'react-toastify';
import { useLoaderData } from 'react-router-dom';
import { Button } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import TanstackTableTwo from '../components/TanstackTableTwo';
const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8000";

const url = '/location/locations';

const modelQuery = {
  queryKey: ['locations'],
  queryFn: () => customFetch(url),
};

export const LocationLoader = (queryClient) => async () => {
  const response = await queryClient.ensureQueryData(modelQuery);
  let locations = [];
  if (response.data.status !== 'error') {
    locations = response.data.data;
  } else {
    toast.error(response.data.message);
  }
  return { locations };
};

const Location = () => {
  const { locations } = useLoaderData();
  const [data, setData] = useState(locations);
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [activeRow, setActiveRow] = useState({});

  useEffect(() => {
    setData(locations);
  }, [locations]);

  const handleFilterLocations = useCallback(
    (search) => {
      const regex = new RegExp(`.*${search.toLowerCase()}.*`, 'i');

      const searchResult = locations.filter((item) => {
        return (
          regex.test(item.locations?.toLowerCase()) ||
          regex.test(item.name?.toLowerCase())
        );
      });

      setData(searchResult);
    },
    [locations]
  );

  const handleDelete = async (id) => {
    const response = await customFetch.delete(
      `/location/location-delete/${id}`
    );
    if (response.data.status !== 'error') {
      await queryClient.invalidateQueries('locations');
      const response = await customFetch(url);
      if (response.data.status !== 'error') {
        setData(response.data.data);
        toast.success(
          response.data.message && 'locations deleted successfully'
        );
      }
    } else {
      toast.error(response.data.message);
    }
  };

  const fetchData = async () => {
    const response = await customFetch(url);
    if (response.data.status !== 'error') {
      setData(response.data.data);
    } else {
      toast.error(response.data.message);
    }
  };

  const handleEdit = (id) => {
    const result = locations.filter((row) => row._id === id)[0];
    setActiveRow(result);
    setShowEdit(!showEdit);
  };

  const columns = [
    { accessorKey: 'name', header: 'Factory Name' },
    { accessorKey: 'location', header: 'Factory Location' },
    {
      accessorKey: 'image',
      header: 'Image',
      cell: (info) => (
        <img className='w-20 h-20 rounded-full' src={
          getRealFileUrl(info.getValue())
        } />
      ),
    },
    {
      accessorFn: (row) => row._id,
      header: 'Action',
      cell: (info) => (
        <div className='flex flex-row gap-2 justify-start items-center'>
          <button
            onClick={() => handleEdit(info.getValue())}
            className='btn btn-outline btn-neutral btn-sm'>
            Edit
          </button>
          <button
            onClick={() => handleDelete(info.getValue())}
            className='btn btn-outline btn-neutral btn-sm'>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='flex flex-col gap-4 px-10 py-5 h-full AllUsers'>
        <div className='flex justify-end'>
          <Button
            className='mr-0 btn btn-success btn-sm'
            onClick={() => setShowModal(true)}>
            + Add Location
          </Button>
        </div>
        <div className='mx-auto w-full searchBarContainer'>
          <div className='px-3 searchIconWrapper'>
            <IoSearchSharp className='img searchImg' color='#858585' />
          </div>
          <input
            className='flex flex-row flex-grow'
            type='text'
            placeholder='Search locations'
            onChange={(e) => handleFilterLocations(e.target.value)}
          />
          <div className='filter'>
            <p>Search</p>
          </div>
        </div>
        <div className='flex flex-col gap-2 w-full'>
          {data && <TanstackTableTwo columns={columns} tableData={data} />}
        </div>
      </div>
      <AddLocation
        showModal={showModal}
        setShowModal={setShowModal}
        fetchData={fetchData}
      />
      <EditLocation
        showModal={showEdit}
        setShowModal={setShowEdit}
        data={activeRow}
        fetchData={fetchData}
      />
    </>
  );
};

export default Location;
