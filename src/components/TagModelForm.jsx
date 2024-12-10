// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { useLoaderData, useNavigate } from 'react-router-dom';
import '../styles/singleModel.css';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import MenuIcon from '@mui/icons-material/Menu';

import { FormInput } from '../components';
import { CiCirclePlus } from 'react-icons/ci';
import { useDispatch, useSelector } from 'react-redux';
import { memoize } from 'proxy-memoize';
import { customFetch } from '../utils';
import ModelViewBabylon from '../components/ModelViewBabylon';
import { toast } from 'react-toastify';
import ModelOnScreenControls from '../components/ModelOnScreenControls';
import {
    Button,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { dispatchSelectedMeshTags } from '../redux/actions/meshActions';
import { toggleSetting } from '../redux/actions/settingActions';
import SettingsIcon from '@mui/icons-material/Settings';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';
import { drawTag } from './SceneComponent';

const TagModelForm = ({ model }) => {
    const dispatch = useDispatch();
    const setting = useSelector(memoize((state) => state.settingState.setting));
    const settingMode = () => {
        dispatch(toggleSetting(!setting));
    };

    const [samples, setSamples] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [mobile, setMobile] = useState(false);
    const [addSample, setAddSample] = useState(false);
    const [addIncident, setAddIncident] = useState(false);
    const [newTaggedInfoName, setNewTaggedInfoName] = useState("");
    const [newTaggedInfoPosition, setNewTaggedInfoPosition] = useState();
    const [newTaggedInfo, setNewTaggedInfo] = useState();
    const [customData, setCustomData] = useState(false);
    const [evidenceName, setEvidenceName] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const goBack = () => {
        navigate(-1);
    };

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
    }, [addSample, addIncident]);

    useEffect(() => {
        const tags = model?.tags;
        if (tags) {
            dispatch(dispatchSelectedMeshTags(tags));
        }
    }, [dispatch, model]);

    const user = useSelector((state) => state.userState.user);
    const localUser = getUserFromLocalStorage();
    const currentUser = localUser || user;
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            setNewTaggedInfoName(modelInterationActiveData.objectName);
        } else {
            setNewTaggedInfoName(meshName);
        }
        setNewTaggedInfoPosition(tagPosition);
        setNewTaggedInfo(modelInterationData);
    }, [modelInterationData, modelInterationActiveData]);
    // eslint-disable-next-line no-unused-vars
    const [formData, setFormData] = useState({
        fullname: currentUser.fullname,
        incident: '',
        evidence: '',
        type: '',
        action: '',
        locations: '',
        presence: '',
        sample: '',
        user: currentUser?._id,
        model: model?._id,
        text: '',
        objectName: newTaggedInfoName,
        taggedInfo: newTaggedInfoPosition,
    });

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'evidence') {
            setEvidenceName(files[0].name);
        }
        setFormData({
            ...formData,
            [name]: files ? files[0] : value || "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.type) {
            toast.error("A Type is required")
            return
        }
        if (!newTaggedInfo) {
            toast.error("Please ensure you have clicked an object to tag, aborting")
            return
        }

        if (formData.type === "sampling" && !formData.sample || !formData.presence) {
            toast.error("Please ensure you have set sample type and presence")
            return
        }

        setIsSubmitting(true);
        try {
            const formDataForUpload = new FormData();
            formDataForUpload.append('fullname', formData.fullname);
            formDataForUpload.append('incident', formData.incident);
            formDataForUpload.append('objectName', newTaggedInfoName);
            formDataForUpload.append('type', formData.type);
            formDataForUpload.append('evidence', formData.evidence);
            formDataForUpload.append('action', formData.action);
            formDataForUpload.append('locations', formData.locations);
            formDataForUpload.append('sample', formData.sample);
            formDataForUpload.append('presence', formData.presence);
            formDataForUpload.append('text', formData.text);
            formDataForUpload.append('taggedInfo', newTaggedInfo);
            formDataForUpload.append('userId', currentUser?._id);
            formDataForUpload.append('modelId', model?._id);

            const response = await customFetch.post('/tag/add', formDataForUpload);
            queryClient.invalidateQueries('singleModel');

            if (response.data?.status !== 'error') {
                toast.success(`Tag added successfully`);
                // drop tag visible
                let tagId = Date.now()
                let tagPosition = currTagPos
                drawTag(scene, tagPosition, tagId, formData.type)
            } else {
                toast.error(response.data?.message);
            }
            setFormData({
                fullname: user?.data?.fullname,
                incident: '',
                evidence: '',
                type: '',
                action: '',
                locations: '',
                presence: '',
                sample: '',
                user: user?._id,
                model: model?._id,
                text: '',
                objectName: newTaggedInfoName,
                taggedInfo: newTaggedInfoPosition,
            });
            setEvidenceName('');
        } catch (error) {
            console.log(error)
            const errorMessage = error?.response?.data?.msg || 'Error adding Tag';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='dataHistoryWrapper'>
            {/* header */}
            <div className='header px-2'>
                <h1 className='text-2xl font-medium'>Add Sample | Incident | Safety</h1>
            </div>
            {/* header end */}

            <form
                onSubmit={handleSubmit}
                method='POST'
                encType='multipart/form-data'
                className='mx-auto flex h-screen w-full flex-grow flex-col items-center justify-between gap-10'>
                <div className='flex w-full flex-col gap-4 p-2'>
                    <div className='flex flex-col'>
                        <FormInput
                            onChange={(e) => {
                                handleInputChange(e);
                                setNewTaggedInfoName(e.target.value);
                            }}
                            label='Object Name'
                            type='text'
                            name='objectName'
                            placeholder='Object Name'
                            size='input-sm'
                            value={newTaggedInfoName}
                        />
                        <FormInput
                            onChange={handleInputChange}
                            label='Location'
                            type='text'
                            name='locations'
                            placeholder='Please type location'
                            size='input-sm'
                            value={formData.locations}
                        />
                        <div className='form-control'>
                            <select
                                onChange={handleInputChange}
                                name="type"
                                value={formData.type}
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

                        {formData?.type === "sampling" && <div className='form-control'>
                            <FormInput
                                onChange={handleInputChange}
                                label='Type of sample'
                                type='text'
                                name='sample'
                                placeholder='Please enter the type of sample'
                                size='input-sm'
                                value={formData.sample}
                                options={["Salmonella", "Listeria"]}
                            />
                        </div>}

                        {formData?.type === "incident" && <div className="form-control">
                            <FormInput
                                onChange={handleInputChange}
                                label='Incident'
                                type='text'
                                name='incident'
                                placeholder='Incident'
                                size='input-sm'
                                value={formData.incident}
                                options={["Crack", "Spill"]}
                            />
                        </div>}
                        {formData?.type === "sampling" && <div className='form-control'>
                            <InputLabel
                                className='label w-full'
                                id='result'>
                                Result
                            </InputLabel>
                            <Select
                                className='input input-bordered h-10 w-full border shadow-none'
                                labelId='result-select'
                                id='result'
                                value={formData?.presence}
                                onChange={handleInputChange}
                                autoWidth
                                name='presence'
                                label='Sample Presence'>
                                <MenuItem className='w-full' value='positive'>
                                    positive
                                </MenuItem>
                                <MenuItem className='w-full' value='negative'>
                                    negative
                                </MenuItem>
                            </Select>
                        </div>}
                        {["sampling", "incident"].includes(formData.type) && <FormInput
                            onChange={handleInputChange}
                            label='Corrective Actions'
                            placeholder='Corrective Actions'
                            type='text'
                            name='action'
                            size='input-sm'
                            value={formData?.action}
                        />}
                        <div className='border-1 input input-sm input-bordered mt-5 flex h-auto min-h-10 flex-col items-center justify-center gap-1'>
                            <Button
                                onClick={() => {
                                    setCustomData(!customData);
                                }}
                                className='capitalize'>
                                <Typography>Note</Typography>
                                <CiCirclePlus />
                            </Button>
                        </div>
                        {customData && (
                            <div className='mt-5 flex h-auto w-full flex-col'>
                                <textarea
                                    className='h-auto w-full rounded-md'
                                    rows={4}
                                    cols={10}
                                    onChange={handleInputChange}
                                    label='text'
                                    placeholder='Please enter addition data here'
                                    type='text'
                                    name='text'
                                    size='input-sm'
                                    value={formData?.text}
                                />
                            </div>
                        )}
                        <div className='form-control'>
                            <label htmlFor='evidence' className='label'>
                                <span className='label-text capitalize'>
                                    Evidence/Image
                                </span>
                            </label>
                            <input
                                type='file'
                                name='evidence'
                                accept='.jpg, .jpeg, .png, .webp'
                                onChange={handleInputChange}
                                placeholder={evidenceName || 'File upload'}
                                className={`input input-sm input-bordered h-10`}
                            />
                        </div>
                    </div>
                    <div className='flex w-full flex-col items-center justify-center gap-2 py-1'>
                        <Button
                            className='btn btn-neutral h-10 w-full border-solid'
                            type='submit'
                            disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className='loading loading-spinner'></span>
                                    processing...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </Button>
                        <Button
                            className='btn btn-outline btn-neutral btn-sm h-10 w-full border-solid'
                            onClick={() => setFormData(formData)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TagModelForm;
