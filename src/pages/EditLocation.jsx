/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { CiLocationOn } from 'react-icons/ci';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';

// eslint-disable-next-line react/prop-types
const EditLocation = ({ showModal, setShowModal, data, fetchData }) => {
  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageName, setImageName] = useState('');
  const [formData, setFormData] = useState({
    name: data.name,
    location: data.location,
    user: currentUser._id,
    image: data.image,
  });

  useEffect(() => {
    setFormData((prev) => {
      return { ...prev, ...data };
    });
  }, [data]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setImageName(files[0].name);
    }
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('name', formData.name);
      formDataForUpload.append('location', formData.location);
      formDataForUpload.append('user', currentUser._id);
      formDataForUpload.append('image', formData.image);

      // eslint-disable-next-line react/prop-types
      const response = await customFetch.put(
        `/location/location-update/${data._id}`,
        formDataForUpload
      );
      if (response.data?.status !== 'error') {
        fetchData();
        toast.success(`Location updated successfully`);
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.msg || 'Error updating location';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(!showModal);
  };
  return (
    <>
      {showModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 py-4'>
          <form
            onSubmit={handleSubmit}
            method='POST'
            encType='multipart/form-data'
            className='card relative flex max-w-md flex-grow flex-col justify-start gap-4 bg-base-100 px-4'>
            <div className='absolute right-5 top-5' onClick={closeModal}>
              <MdOutlineCancel className='h-5 w-5' />
            </div>
            <div className='flex flex-col items-center justify-center'>
              <CiLocationOn className='h-10 w-10' />
              <h3 className='mb-4 text-center text-2xl font-bold'>
                Edit Location
              </h3>
            </div>
            <div className='flex flex-col gap-y-5'>
              <div className='flex flex-col gap-2'>
                <label className='font-semibold'>Factory Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  placeholder='Parckard United Factory'
                  className='input input-bordered'
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label className='font-semibold'>Factory Location</label>
                <input
                  type='text'
                  name='location'
                  value={formData.location}
                  placeholder=' Glacier National Park, Montana'
                  className='input input-bordered'
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='flex flex-col items-center gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4'>
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
                    required
                    name='image'
                    accept='.jpg, .jpeg, .png, .webp'
                    className='hidden'
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
            <button
              className='btn btn-neutral my-3'
              type='submit'
              disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className='loading loading-spinner'></span>
                  sending...
                </>
              ) : (
                'Save'
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default EditLocation;
