// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { customFetch } from "../utils";
import { toast } from "react-toastify";
import { SubmitBtn, Successful } from "../components";
import { useLoaderData } from "react-router-dom";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { FormControl, MenuItem, Select } from "@mui/material";

const singleUserQuery = (id) => {
  return {
    queryKey: ["user", id],
    queryFn: () => customFetch.get(`/user/get-a-user/${id}`),
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const singleUserLoader =
  (queryClient) =>
  async ({ params }) => {
    const response = await queryClient.ensureQueryData(
      singleUserQuery(params.id)
    );
    const user = response.data?.data;
    if (response?.data.status === "error") {
      toast.error(response?.data.message);
    }
    return { user };
  };

const EditUser = () => {
  const { user } = useLoaderData();
  const [formData, setFormData] = useState({
    fullname: user.fullname,
    username: user.username,
    email: user.email,
    role: user.role,
    image: user.imageUrl,
    location: user.location,
  });
  // const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageName, setImageName] = useState("");
  const [locations, setLocations] = useState([]);
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setImageName(files[0].name);
    }
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  async function fetchLocations() {
    await customFetch.get("/location/locations").then(({ data }) => {
      if (data?.data) {
        const LocationsNew = data.data.map((item) => ({
          label: item.name,
          value: item._id,
        }));
        setLocations(LocationsNew);
      }
    });
  }

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleClick = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append("fullname", formData.fullname);
      formDataForUpload.append("email", formData.email);
      formDataForUpload.append("password", formData.password);
      formDataForUpload.append("username", formData.username);
      formDataForUpload.append("role", formData.role);
      formDataForUpload.append("image", formData.image);
      formDataForUpload.append("location", formData.location);
      const response = await customFetch.put(
        `/user/update-user/${user._id}`,
        formDataForUpload
      );
      if (response.data?.status !== "error") {
        toast.success(`User Edited successfully`);
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || "Error editing user";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 AddUser">
      <form
        method="POST"
        encType="multipart/form-data"
        className='flex flex-col justify-start items-center w-full h-screen'
        onSubmit={handleClick}
      >
        <div className="flex flex-col gap-4 justify-center items-center w-full max-w-2xl">
          <div className="heading">
            <h1 className="text-3xl font-bold text-center">Edit User</h1>
            <p className="mb-3 text-center font-[3400]">
              Please edit user details
            </p>
          </div>
          <div className="flex flex-col justify-center items-start w-full">
            <p>Fullname</p>
            <input
              type="text"
              className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
              name="fullname"
              value={formData.fullname}
              placeholder="Enter your fullname"
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col justify-center items-start w-full">
            <p>Email</p>
            <input
              type="text"
              className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
              name="email"
              value={formData.email}
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col justify-center items-start w-full">
            <p>Username</p>
            <input
              type="text"
              className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
              name="username"
              value={formData.username}
              placeholder="Enter your username"
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col justify-center items-start w-full">
            <p>User Role</p>
            <select
              name="role"
              className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option>Select user role...</option>
              {user.role === "superAdmin" && <option value="superAdmin">SuperAdmin</option>}
              <option value="tagger">Sampler</option>
              <option value="reviewer">Reviewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className='mt-2 mb-4 w-full form-control'>
          <p>Location</p>
          <FormControl fullWidth className='border-0 shadow-none'>
            <Select
              className="w-full h-11 border shadow-none input input-bordered"
              labelId="demo-simple-select-label"
              id="demo-simple-select-label"
              value={formData?.location?._id}
              onChange={handleChange}
              autoWidth
              name="location"
            >
              {Array.isArray(locations) &&
                locations.map((items, index) => (
                  <MenuItem className="w-full" key={index} value={items.value}>
                    {items.label}
                  </MenuItem>
                ))}
            </Select>
            </FormControl>
          </div>
          <div
            className={`flex flex-col items-center gap-y-2 w-full rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4`}
          >
            <div className="img">
              <AiOutlineCloudUpload />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold">
                Choose a cover photo to upload
              </h3>
              <p>JPEG, PNG, up to 2MB</p>
            </div>
            <label className="btn">
              <span>{imageName || "Browse Files"}</span>
              <input
                type="file"
                name="image"
                accept=".jpg, .jpeg, .png, .webp"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="mt-4 w-full">
            <SubmitBtn text="Edit User" isSubmitting={isSubmitting} />
          </div>
        </div>
      </form>
      <Successful
        text="User Edited"
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </div>
  );
};

export default EditUser;
