/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { Link, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import '../styles/singleModel.css';
import AccordionWrapper from './AccordionWrapper';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ModelViewBabylon from '../components/ModelViewBabylon';
import ModelOnScreenControls from '../components/ModelOnScreenControls';
import { useDispatch, useSelector } from 'react-redux';
import { memoize } from 'proxy-memoize';
import CloseIcon from '@mui/icons-material/Close';
import {
  customFetch,
  filterDataByDateAndTimeRange,
  formatDate,
  formatTime,
  removeCommas,
} from '../utils';
import { toast } from 'react-toastify';
import { dispatchSelectedMeshTags } from '../redux/actions/meshActions';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { toggleSetting } from '../redux/actions/settingActions';
import { InputLabel, MenuItem, Select } from '@mui/material';
import TagModelForm from '../components/TagModelForm';
import { FormInput } from '../components';

const SingleModel = () => {
  const { model } = useLoaderData();
  const { id } = useParams();
  const dispatch = useDispatch();
  const setting = useSelector(memoize((state) => state.settingState.setting));
  const settingMode = () => {
    dispatch(toggleSetting(!setting));
  };

  const [searchApplied, setSearchApplied] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('24:00');
  const [mobile, setMobile] = useState(false);
  const [ReviewerState, setReviewerState] = useState('allReviewer');
  const [filterApplied, setFilterApplied] = useState(false);
  const [exportData, setExportData] = useState(false);
  const [fileExported, setFileExported] = useState(false);
  const [tagsData, setTagsData] = useState([]);
  const [newTaggedInfoName, setNewTaggedInfoName] = useState('');
  const [newTaggedInfoPosition, setNewTaggedInfoPosition] = useState('');
  const [newTaggedInfo, setNewTaggedInfo] = useState({});
  const [samples, setSamples] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [sampleChoosed, setSampleChoosed] = useState('');
  const [typeChoosed, setTypeChoosed] = useState('');
  const [incidentChoosed, setIncidentChoosed] = useState('');
  const [resultChoosed, setResultChoosed] = useState('');
  const [activePane, setActivePane] = useState('view-tags');
  const navigate = useNavigate();

  async function fetchSamples() {
    await customFetch.get('/sample/samples').then(({ data }) => {
      if (data?.data) {
        const samplesNew = data.data.map((item) => ({
          label: item.name,
          value: item._id,
        }));
        setSamples(samplesNew);
      }
    });
  }

  async function fetchIncidents() {
    await customFetch.get('/incident/incidents').then(({ data }) => {
      if (data?.data) {
        const IncidentsNew = data.data.map((item) => ({
          label: item.name,
          value: item._id,
        }));
        setIncidents(IncidentsNew);
      }
    });
  }

  useEffect(() => {
    fetchSamples();
    fetchIncidents();
  }, []);

  useEffect(() => {
    const tags = model?.tags;
    if (tags) {
      dispatch(dispatchSelectedMeshTags(tags));
    }
  }, [dispatch, model]);

  useEffect(() => {
    if (model?.tags) {
      setTagsData(model.tags);
    }
  }, [model?.tags]);

  const goBack = () => {
    navigate(-1);
  };
  // eslint-disable-next-line no-unused-vars
  const modelInterationData = useSelector(
    memoize((state) => state.selectedMeshState.data)
  );

  const modelInterationActiveData = useSelector(
    memoize((state) => state.selectedMeshState.activeMeshData)
  );

  const destructureTaggedInfo = (modelInterationData) => {
    if (modelInterationData) {
      const newTaggedinfo = JSON.parse(modelInterationData);
      return [newTaggedinfo?.meshName, newTaggedinfo?.tagPosition];
    } else {
      return [];
    }
  };

  useEffect(() => {
    const [meshName, tagPosition] = destructureTaggedInfo(modelInterationData);
    if (
      meshName &&
      destructureTaggedInfo(modelInterationActiveData?.taggedInfo)[0]
    ) {
      // hack
      // setNewTaggedInfoName(modelInterationActiveData.objectName);
    }
    setNewTaggedInfoPosition(tagPosition);
    setNewTaggedInfo(modelInterationData);
  }, [modelInterationData, modelInterationActiveData]);

  function resetTagsData() {
    setTagsData(model?.tags);
  }

  const handleFilterTags = useCallback(
    (search) => {
      if (!search.length) {
        setTagsData(model.tags || [])
        return
      }
      const regex = new RegExp(`.*${search.toLowerCase()}.*`, 'i');

      const searchResult = (model.tags || []).filter((item) => {
        return (
          regex.test(item.objectName?.toLowerCase()) ||
          regex.test(item.incident?.toLowerCase()) ||
          regex.test(item.presence?.toLowerCase()) ||
          regex.test(item.sample?.toLowerCase()) ||
          regex.test(item.locations?.toLowerCase()) ||
          regex.test(item.text?.toLowerCase()) ||
          regex.test(item.type?.toLowerCase()) ||
          regex.test(item.slug?.toLowerCase())
        );
      });

      setTagsData(searchResult);
    },
    [tagsData, setTagsData]
  );

  function exportToCsv() {
    toast.success('Exporting data...');
    // Preprocess the data (formatting, etc.)
    var formattedRows = [];
    for (var i = 0; i < tagsData.length; i++) {
      var formattedRow = [];
      formattedRow.push(tagsData[i].objectName);
      formattedRow.push(tagsData[i].slug);
      formattedRow.push(tagsData[i].incident?.name);
      formattedRow.push(tagsData[i].evidence);
      formattedRow.push(tagsData[i].locations);
      formattedRow.push(tagsData[i].presence);
      formattedRow.push(tagsData[i].sample?.name);
      formattedRow.push(tagsData[i].user.username);
      formattedRow.push(model.modelName);
      formattedRow.push(tagsData[i].text);
      formattedRow.push(removeCommas(formatDate(tagsData[i].createdAt)));
      formattedRow.push(formatTime(tagsData[i].createdAt));
      formattedRows.push(formattedRow);
    }
    // Create CSV content
    var csvContent =
      'ObjectName,Ref,Actions,Evidence,Locations,Result,Type,Username,Model,Note,Date,Time\n'; // Adding header row

    // Add rows
    for (var j = 0; j < formattedRows.length; j++) {
      csvContent += formattedRows[j].join(',') + '\n';
    }

    // Create a Blob object with CSV content
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a temporary URL for the Blob object
    var url = URL.createObjectURL(blob);

    // Create a link element
    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', model.name);

    // Append the link to the document body
    document.body.appendChild(link);
    // Trigger the click event on the link to initiate download
    link.click();

    // Clean up by revoking the temporary URL
    URL.revokeObjectURL(url);
    toast.success('Data exported Successfully');
  }

  const AddFilter = () => {
    setReviewerState('filter');
  };

  const ApplyFilterButton = async () => {
    setFilterApplied(true);
    setReviewerState('allReviewer');
    const result = await filterDataByDateAndTimeRange(
      model.tags || [],
      startDate,
      endDate,
      startTime,
      endTime
    );
    if (result.length && typeChoosed === 'sampling') {
      if (sampleChoosed.length) {
        const filterResult = result.filter((item) => item?.sample?.toLowerCase() === sampleChoosed.toLowerCase() && (item?.presence.toLowerCase() === resultChoosed.toLowerCase() || !resultChoosed));
        setTagsData(filterResult);
      } else {
        toast.error("please choose sample type, aborting filter apply");
      }
    } else if (result.length && typeChoosed === 'incident') {
      if (incidentChoosed.length) {
        const filterResult = result.filter((item) => item?.incident?.toLowerCase() === incidentChoosed.toLowerCase());
        setTagsData(filterResult);
      } else {
        toast.error("please choose incident type, aborting filter apply");
      }
    } else if (result.length && typeChoosed === 'safety') {
      if (typeChoosed.length) {
        const filterResult = result.filter((item) => item?.type === typeChoosed.toLowerCase());
        setTagsData(filterResult);
      } else {
        setTagsData(result);
      }
    } else {
      setTagsData(result);
    }

  };

  const ClearFilter = () => {
    setFilterApplied(false);
    setReviewerState('allReviewer');
    resetTagsData();
  };

  const CancelExport = () => {
    setFileExported(false);
    setExportData(false);
    resetTagsData();
  };
  const promptDelete = () => {
    if (confirm("Are you sure you want delete all samples")) {
      handleDelete()
    }
  };

  const handleDelete = async () => {
    const response = await customFetch.delete(`/tag/delete-model-tags/${id}`);
    if (response.data.status !== 'error') {
      toast.success(
        response.data.message || 'All Samples deleted successfully'
      );
      model.tags = []
      setTagsData([])
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div className='h-screen ReviewerDashBoardWraper'>
      <div className='ReviewerDashBoard'>
        {/*threejs animation wrapper start  */}
        <div className='h-screen threejsWrapper'>
          <div className='w-screen h-screen threejsAnimationWrapper'>
            <ModelViewBabylon MODEL_URL={model.file} tags={tagsData} model={model} />
          </div>
          <div className='navigation'>
            <div onClick={goBack}>
              <div className='cursor-pointer backContainer'>
                <p>Back</p>
                <CancelOutlinedIcon fontSize='small' />
              </div>
            </div>
            <div className='flex flex-row gap-2 justify-end items-center'>
              <div className='hidden w-10 h-10'>
                <SettingsIcon
                  className='text-white cursor-pointer'
                  onClick={() => settingMode()}
                />
              </div>
              {mobile ? (
                <div
                  className='flex w-10 h-10 menu'
                  onClick={() => setMobile(!mobile)}>
                  <MenuIcon className='text-white cursor-pointer' />
                </div>
              ) : (
                <div
                  className='flex w-10 h-10 mobileMenu'
                  onClick={() => setMobile(!mobile)}>
                  <MenuIcon className='text-white cursor-pointer' />
                </div>
              )}
            </div>
          </div>
          <ModelOnScreenControls />
        </div>
        {/*threejs animation wrapper ends  */}

        {/* All information wrapper start */}
        <div className={mobile ? 'alldataWrapperMobile' : 'alldataWrapper'}>
          <div className='dataWrapper'>
            <div>
              <div className='flex justify-between items-baseline px-2 py-2'>
                <h3 className='cursor-pointer font-bold'
                  onClick={() => setActivePane('view-tags')}
                >
                  view tags
                </h3>
                <h3 className='cursor-pointer font-bold'
                  onClick={() => setActivePane('tag-model')}
                >
                  tag model
                </h3>
                <div className='menuWrapper'>
                  <div
                    className='menu h-10 w-10 cursor-pointer'
                    onClick={() => setMobile(!mobile)}>
                    <MenuIcon />
                  </div>
                </div>
              </div>
              {activePane === "view-tags" && <div className='dataHistoryWrapper'>
                {/* header */}
                <div className='px-2 header'>
                  <h1 className='text-2xl font-medium'>Sample History</h1>
                </div>
                {/* header end */}
                {/* input */}
                <div className='h-14 AllModels'>
                  <div className='searchBarContainer'>
                    <div className='searchIconWrapper'>
                      <div
                        className='img searchImg'
                        onClick={() => {
                          setSearchApplied(false);
                          resetTagsData();
                        }}>
                        {searchApplied !== true ? (
                          <img
                            className='m-2 ml-3 w-[20px]'
                            src='/img/search (2).png'
                            alt='icon'
                          />
                        ) : (
                          <CloseIcon />
                        )}
                      </div>
                    </div>
                    <input
                      className='h-14 bg-[#585858]'
                      type='text'
                      name='search'
                      value={newTaggedInfoName}
                      placeholder='Search'
                      onChange={(e) => {
                        handleFilterTags(e.target.value);
                        setNewTaggedInfoName(e.target.value);
                        setSearchApplied(true);
                      }}
                    />
                    {filterApplied ? (
                      <div className='filter' onClick={ClearFilter}>
                        <div className='clear'>clear</div>
                      </div>
                    ) : (
                      <div className='filter' onClick={AddFilter}>
                        <div className='img'>
                          <img src='/img/Group 27014.png' alt='image' />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* input end */}

                {filterApplied && (
                  <div className='appliedFilterWrapper'>
                    <div className='appliedFilterContainer'>
                      <div className='fromWrapper'>
                        <h3>From</h3>
                        <div className='rounded-md wrapper'>
                          <CalendarTodayOutlinedIcon
                            fontSize='small'
                            className='date'
                          />
                          <p className='truncate text-[4px]'>
                            {formatDate(startDate)}
                          </p>
                        </div>
                        <div className='rounded-md wrapper'>
                          <AccessTimeIcon className='time' fontSize='small' />
                          <p className='truncate text-[4px]'>
                            {startTime ?? '00:00'}
                          </p>
                        </div>
                      </div>
                      <div className='toWrapper'>
                        <h3>to</h3>
                        <div className='rounded-md wrapper'>
                          <CalendarTodayOutlinedIcon
                            fontSize='small'
                            className='date'
                          />
                          <p className='truncate text-[4px]'>
                            {formatDate(endDate)}
                          </p>
                        </div>
                        <div className='rounded-md wrapper'>
                          <AccessTimeIcon className='time' fontSize='small' />
                          <p className='truncate text-[4px]'>
                            {endTime ?? '24:00'}
                          </p>
                        </div>
                      </div>
                      {/* <div className="">
                      {sampleChoosed} : {resultChoosed}
                    </div> */}
                    </div>
                    <button
                      className='cancelFilter'
                      onClick={() => {
                        setFilterApplied(false);
                        resetTagsData();
                      }}>
                      <CancelOutlinedIcon fontSize='small' />
                      <p>Cancel filter</p>
                    </button>
                  </div>
                )}

                {/* all info container */}
                {ReviewerState === 'allReviewer' && (
                  <div className='flex flex-col gap-4 justify-start items-center mx-auto w-full'>
                    <div className='flex flex-col justify-start w-full'>
                      {/* accordion start */}
                      <AccordionWrapper data={tagsData} setTagsData={setTagsData} model={model} />
                      {/* accordion end */}
                    </div>
                    <div
                      className='w-full btnContainer'
                      onClick={() => exportToCsv()}>
                      <button className='w-full'>Export Data</button>
                    </div>
                    <div className='w-full btnContainer'>
                      <button
                        className='w-full'
                        style={{ background: '#6e0101' }}
                        onClick={promptDelete}>
                        Delete All Samples
                      </button>
                    </div>
                  </div>
                )}
                {/* all info container end*/}
                {/* filter card */}
                {ReviewerState === 'filter' && (
                  <div className='w-full filterCard'>
                    <div className='flex flex-row justify-center items-center my-auto w-full h-10 heading'>
                      <p className=''>Static Period</p>
                    </div>
                    <div className='filterInputContainer max-w-[92%]'>
                      <div className='fromWrapper'>
                        <h3>From</h3>
                        <div className='inputContainer'>
                          <input
                            className='text-sm'
                            value={startDate}
                            type='date'
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                          <input
                            type='time'
                            value={startTime}
                            className='text-sm'
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='fromWrapper'>
                        <h3>To</h3>
                        <div className='inputContainer'>
                          <input
                            type='date'
                            value={endDate}
                            color='white'
                            className='text-sm'
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                          <input
                            type='time'
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className='text-sm'
                          />
                        </div>
                      </div>
                      <div className='fromWrapper'>
                        <div className='w-full form-control'>
                          <InputLabel
                            className='w-full label'
                            id='demo-simple-select-label'
                          >
                            Filter by Type
                          </InputLabel>
                          <select
                            value={typeChoosed}
                            onChange={(e) => setTypeChoosed(e.target.value)}
                            name='type'
                            required
                            className="w-full p-2 border rounded"
                          >
                            <option value="" disabled>Select Type</option>
                            {[
                              { value: "safety", label: "Safety" },
                              { value: "incident", label: "Incident" },
                              { value: "sampling", label: "Sampling" }
                            ].map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {typeChoosed === "incident" && <div className='fromWrapper'>
                        <div className='w-full form-control'>
                          <InputLabel
                            className='w-full label'
                            id='demo-simple-select-label'
                          >
                            Filter by Incident
                          </InputLabel>
                          <FormInput
                            onChange={(e) => setIncidentChoosed(e.target.value)}
                            label='Incident'
                            type='text'
                            name='incident'
                            placeholder='Incident'
                            size='input-sm'
                            value={incidentChoosed}
                            options={["Crack", "Spill"]}
                          />
                        </div>

                      </div>}
                      {typeChoosed === "sampling" && <div className='fromWrapper'>
                        <div className='w-full form-control'>
                          <InputLabel
                            className='w-full label'
                            id='demo-simple-select-label'
                          >
                            Filter by sample
                          </InputLabel>
                          <FormInput
                            onChange={(e) => setSampleChoosed(e.target.value)}
                            label='Type of sample'
                            type='text'
                            name='sample'
                            placeholder='Please enter the type of sample'
                            size='input-sm'
                            value={sampleChoosed}
                            options={["Salmonella", "Listeria"]}
                          />
                        </div>

                      </div>}

                      {typeChoosed === "sampling" && <div className='fromWrapper'>
                        <div className='form-control'>
                          <InputLabel
                            className='w-full label'
                            id='demo-simple-select-label'
                          >
                            Filter by results
                          </InputLabel>
                          <Select
                            className='w-full h-10 border shadow-none input input-bordered'
                            labelId='demo-simple-select-label'
                            id='demo-simple-select-label'
                            value={resultChoosed}
                            onChange={(e) => setResultChoosed(e.target.value)}
                            autoWidth
                            name='results'
                            label='results'>
                            <MenuItem
                              className='w-full'
                              value={"positive"}>
                              Positive
                            </MenuItem>
                            <MenuItem
                              className='w-full'
                              value={"negative"}>
                              Negative
                            </MenuItem>
                          </Select>
                        </div>
                      </div>}
                      <div className='controlBtn'>
                        <button className='cancel' onClick={ClearFilter}>
                          Cancel
                        </button>
                        <button className='apply' onClick={ApplyFilterButton}>
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* filter end */}
              </div>}
              {activePane === "tag-model" && <TagModelForm
                model={model}
                setTagsData={setTagsData}
                tagsData={tagsData}
              />}
            </div>
          </div>
        </div>
        {/* All information wrapper end */}

        {/* export data container */}
        {exportData && (
          <div className='confirmationModalWrapper'>
            <div className='confirmationModal'>
              <div className='cancel' onClick={CancelExport}>
                <CancelOutlinedIcon fontSize='large' />
              </div>
              {/* for export controlls */}
              {fileExported ? (
                <div className='exportSuccessful'>
                  <div className='wrapper'>
                    <div className='img'>
                      <img src='/img/Group 215.png' alt='' />
                    </div>
                    <h1>export successfully</h1>
                  </div>
                </div>
              ) : (
                <div className='exportWrapper'>
                  <div className='btnWrapper'>
                    <button
                      onClick={() => {
                        setFileExported(true);
                        exportToCsv();
                      }}
                      className=''>
                      <div className='menu'>
                        <VideocamOutlinedIcon fontSize='large' />
                      </div>
                      <p>Export Data To CSV</p>
                    </button>
                    {/* <button className=""><div className="menu"><DescriptionOutlinedIcon className="none" fontSize='large' /></div><p>Export video</p></button>
                    <button className=""><div className="menu"><ImageOutlinedIcon fontSize='large' /></div><p>Export video</p></button> */}
                  </div>
                </div>
              )}
              {/* for export successful */}
            </div>
          </div>
        )}
        {/*export data end */}
      </div>
    </div>
  );
};

export default SingleModel;
