// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { SubmitBtn } from '../components';
import { useLoaderData, useParams } from 'react-router-dom';
import { AiOutlineCloudUpload } from 'react-icons/ai';

const EditModel = () => {
  const { model } = useLoaderData();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState();
  const [imageName, setImageName] = useState('');
  const [formData, setFormData] = useState({
    modelName: model.modelName,
    description: model.description,
    location: model.location?._id,
    coverPicture: model.coverPicture,
  });
  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;
  async function fetchLocations() {
    await customFetch.get('/location/locations').then(({ data }) => {
      if (data?.data) {
        const locationsNew = data.data.map((item) => ({
          label: item.name,
          value: item._id,
        }));
        setLocations(locationsNew);
      }
    });
  }

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'coverPicture') {
      setImageName(files[0].name);
    }
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('modelName', formData.modelName);
      formDataForUpload.append('description', formData.description);
      formDataForUpload.append('location', formData.location);
      formDataForUpload.append('image', formData.coverPicture);
      formDataForUpload.append('userId', currentUser?._id);
      const response = await customFetch.post(
        `/model/update-model/${id}`,
        formDataForUpload
      );
      if (response.data?.status !== 'error') {
        toast.success(`Model edited successfully`);
        setImageName('');
      } else {
        toast.error(response.data?.message);
      }
      // setShowModal(true);
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Error editing Model';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='py-8 AddUser'>
      <form
        method='POST'
        encType='multipart/form-data'
        className='flex flex-col justify-start items-center w-full h-screen'
        onSubmit={handleEdit}>
        <div className='flex flex-col gap-4 justify-center items-center w-full max-w-2xl'>
          <div className='heading'>
            <h1 className='text-3xl font-bold text-center'>Edit Model</h1>
            <p className='mb-3 text-center font-[3400]'>
              Please edit model details
            </p>
          </div>
          <div className='flex flex-col justify-center items-start w-full'>
            <p>Model name</p>
            <input
              className='p-1 w-full h-11 rounded-md border border-gray-400 border-solid'
              type='text'
              name='modelName'
              value={formData.modelName}
              placeholder='Enter model name'
              onChange={handleInputChange}
              required
            />
          </div>
          <div className='flex flex-col justify-center items-start w-full'>
            <p>Description</p>
            <input
              type='text'
              className='p-1 w-full h-11 rounded-md border border-gray-400 border-solid'
              name='description'
              value={formData.description}
              placeholder='Enter model description'
              onChange={handleInputChange}
              required
            />
          </div>
          <div className='flex flex-col justify-center items-start w-full'>
            <p>Location</p>
            <FormControl fullWidth className='border-0 shadow-none'>
              <Select
                className='p-1 w-full h-11 border-0 shadow-none'
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                onChange={handleInputChange}
                fullWidth
                placeholder='Select a location'
                required
                value={formData.location}
                name='location'>
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                {Array.isArray(locations) &&
                  locations.map((items, index) => (
                    <MenuItem key={index} value={items.value}>
                      {items.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </div>
          <div
            className={`flex flex-col items-center w-full gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4`}>
            <div className='img'>
              <AiOutlineCloudUpload />
            </div>
            <div className='text-center'>
              <h3 className='text-lg font-bold'>
                Choose a cover photo to upload
              </h3>
              <p>JPEG, PNG, up to 2MB</p>
            </div>
            <label className='btn'>
              <span>{imageName || 'Browse Files'}</span>
              <input
                type='file'
                name='coverPicture'
                accept='.jpg, .jpeg, .png, .webp'
                className='hidden'
                onChange={handleInputChange}
              // required
              />
            </label>
          </div>
          <div className='mt-4 w-full'>
            <SubmitBtn text='Save model' isSubmitting={isSubmitting} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditModel;
