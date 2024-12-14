/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import RemoveIcon from '@mui/icons-material/Remove';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { memoize } from 'proxy-memoize';
import { customFetch, getRealFileUrl } from '../utils';
import { toast } from 'react-toastify';
import { Button, Card } from '@mui/material';
import ReactPaginate from 'react-paginate';
import { useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// import ModalCard component
import { ModelCard } from '../components/ModelCard';


const url = '/model/get-models';

const modelQuery = {
  queryKey: ['model'],
  queryFn: () => customFetch(url),
};

export const loader = (queryClient) => async () => {
  // hack
  const response = await queryClient.ensureQueryData(modelQuery);

  // let demo = { _id: "model2.glb", coverPicture: "", modelName: "model 2" }
  // const response = {data: {status: "success", data: [demo]}}
  let model = [];
  if (response.data.status !== 'error') {
    model = response.data.data || [];
  } else {
    toast.error(response.data.message);
  }
  return { model };
};

const AllModels = () => {
  const { model } = useLoaderData();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modelList, setModelList] = useState([]);
  const [deleteModel, setDeleteModel] = useState(false);
  const [modelToDelList, setModelToDelList] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = useMemo(
    () => model.slice(itemOffset, endOffset),
    [endOffset, itemOffset, model]
  );
  const pageCount = Math.ceil(model.length / itemsPerPage);

  const handlePageClick = (event) => {
    setItemOffset(event.selected);
  };

  const user = useSelector(memoize((state) => state.userState.user));
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;

  const fetchData = async () => {
    // hack
    const response = await customFetch(url);
    // let demo = { _id: "model2.glb", coverPicture: "", modelName: "model 2" }
    // const response = {data: {status: "success", data: [demo]}}
    if (response.data.status !== 'error') {
      setModelList(response.data.data);
    } else {
      toast.error(response.data.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const mutation = useMutation(
    // hack - post method?
    (ids) => customFetch.post(`/model/soft-delete-models/`, { modelIds: ids }),
    {
      onSuccess: async () => {
        toast.success('Model(s) deleted successfully');
        await queryClient.invalidateQueries('model');
        const response = await queryClient.fetchQuery(['model'], modelQuery);
        if (response.data.status !== 'error') {
          setModelList(response.data.data);
        } else {
          toast.error(response.data.message);
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  const handleDeleteModels = () => {
    setConfirmDelete(false);
    setDeleteModel(false);
    mutation.mutate(modelToDelList);
  };

  useEffect(() => {
    setModelList(currentItems);
  }, [currentItems]);

  const handleDeleteAModel = (id) => {
    setConfirmDelete(false);
    setDeleteModel(false);
    mutation.mutate([id]);
  };

  const deleteModels = () => {
    setConfirmDelete(false);
    setDeleteModel(false);
  };

  const handleCheckedForSoftDelete = (id) => {
    if (modelToDelList.includes(id)) {
      setModelToDelList(modelToDelList.filter((item) => item !== id));
    } else {
      setModelToDelList([...modelToDelList, id]);
    }
  };

  const handleFilterModels = useCallback(
    (search) => {
      const regex = new RegExp(`.*${search.toLowerCase()}.*`, 'i');
      const searchResult = model.filter((item) => {
        return regex.test(item.modelName.toLowerCase());
      });
      setModelList(searchResult);
    },
    [model, setModelList]
  );

  return (
    <div className='AllModels box-border w-full py-5'>
      <main className='w-full'>
        <div className='modelControl mb-3 w-full items-center justify-end px-1 lg:px-3 xl:px-5'>
          {deleteModel ? (
            <div className='deleteModeWrapper flex flex-row items-center justify-between'>
              <div
                className='backBtnWrapper flex flex-row items-center justify-center gap-4'
                onClick={deleteModels}>
                <div className='back flex h-10 items-center justify-center'>
                  <img src='/img/back (4).png' alt='icon' className='my-auto' />
                </div>
                <Button className='add btn btn-sm mr-5 bg-white shadow-none'>
                  <div className='flex max-sm:text-sm'>back</div>
                </Button>
              </div>
              <Button
                className='add btn btn-success btn-sm mr-5 bg-red-900'
                onClick={() => setConfirmDelete(true)}>
                <RemoveIcon style={{ color: '#FFF' }} />
                <p className='text-white max-md:truncate max-sm:text-sm'>
                  Delete Selected model
                </p>
              </Button>
            </div>
          ) : (
            <div className='mr-5 flex items-center justify-end gap-4'>
              <Link
                to={`${['admin', 'superAdmin'].includes(currentUser.role)
                  ? '/admin/models/add-model'
                  : currentUser.role === 'sampler'
                    ? '/sampler/models/add-model'
                    : '/login'
                  }`}>
                <Button className='btn btn-success btn-sm mr-0'>
                  <p className='max-sm:text-sm'>+ Add model</p>
                </Button>
              </Link>
              <Button
                className='btn btn-success btn-sm mr-0'
                onClick={() => setDeleteModel(true)}>
                <p className='text-[red] max-sm:text-sm'>- Delete model</p>
              </Button>
            </div>
          )}
        </div>

        <div className='searchBarContainer mx-3 w-[94%]'>
          <div className='searchIconWrapper'>
            <div className='img searchImg ml-2'>
              <img src='/img/search (2).png' alt='icon' />
            </div>
          </div>
          <input
            className='max-sm:text-sm'
            type='text'
            name='search'
            placeholder='Search model'
            onChange={(e) => handleFilterModels(e.target.value)}
          />
          <div className='filter'>
            <div className='img'>
              <img className='max-sm:w-10' src='/img/edit.png' alt='' />
            </div>
            <p className='max-sm:text-sm'>Search</p>
          </div>
        </div>
        <div className='flex flex-wrap justify-start gap-6 p-6'>
          {modelList?.map((item, index) => (
            <div key={index} className="w-[calc(33.33%-1rem)] min-w-[300px]">
              <ModelCard
                model={item}
                onDelete={handleDeleteAModel}
                onEdit={(id) =>
                  navigate(
                    `/${['admin', 'superAdmin'].includes(user?.role)
                      ? 'admin'
                      : user?.role
                    }/edit-model/${id}`
                  )
                }
                deleteModel={deleteModel}
                onCheck={handleCheckedForSoftDelete}
                userRole={user?.role}
              />
            </div>
          ))}
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
            activeclassname='m-1 rounded-full bg-black p-0 text-white'
            forcePage={itemOffset}
          />
        </div>
        {confirmDelete && (
          <div className='confirmationModalWrapper absolute'>
            <div className='confirmationModal'>
              <h1>Are you sure you want to delete?</h1>
              <div className='btnWrapper'>
                <button
                  className='Yes'
                  onClick={() => {
                    deleteModels();
                    handleDeleteModels();
                  }}>
                  Yes
                </button>
                <button className='No' onClick={() => setConfirmDelete(false)}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllModels;
