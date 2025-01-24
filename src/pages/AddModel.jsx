// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { Successful } from "../components";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { customFetch } from "../utils";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";

const AddModel = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState();
  const [imageName, setImageName] = useState("");
  const [modelName, setModelName] = useState("");
  const [formData, setFormData] = useState({
    modelName: "",
    description: "",
    location: "",
    file: null,
    coverPicture: null,
  });
  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;
  async function fetchLocations() {
    await customFetch.get("/location/locations").then(({ data }) => {
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
    if (name === "file") {
      setModelName(files[0].name);
    }
    if (name === "coverPicture") {
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
      if (!formData.file) {
        toast.error("please provide a model file")
        return
      }
      formDataForUpload.append("modelName", formData.modelName);
      formDataForUpload.append("description", formData.description);
      formDataForUpload.append("location", formData.location);
      formDataForUpload.append("model", formData.file);
      formDataForUpload.append("size", formData.file.size);
      formDataForUpload.append("image", formData.coverPicture);
      formDataForUpload.append("userId", currentUser?._id);

      const response = await customFetch.post(
        "/model/create-models",
        formDataForUpload
      );
      if (response.data?.status !== "error") {
        toast.success(`Model added successfully`);
        setFormData({
          modelName: "",
          description: "",
          location: "",
          file: null,
          coverPicture: null,
        });
        setModelName("");
        setImageName("");
      } else {
        toast.error(response.data?.message);
      }
      // setShowModal(true);
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || "Error adding model";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="grid gap-10 place-items-center py-5 w-full">
      <form
        onSubmit={handleSubmit}
        method="POST"
        encType="multipart/form-data"
        className="flex flex-col justify-start items-center w-full h-screen"
      >
        <h3 className="mb-4 text-3xl font-bold text-center">Add Facility Section</h3>
        <div className="flex flex-col gap-4 justify-center items-center w-full max-w-2xl">
          <input
            type="text"
            name="modelName"
            placeholder="Facility Section Name"
            className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Facility Section Description"
            className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
            onChange={handleInputChange}
            required
          />
          {/* <div className='form-control'> */}
          <FormControl fullWidth className="border-0 shadow-none">
            <InputLabel id="demo-simple-select-label ">
              Select a location
            </InputLabel>
            <Select
              className="w-full h-12 border-0 shadow-none"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              onChange={handleInputChange}
              fullWidth
              label="Select a location"
              placeholder="Select a location"
              required
              value={formData.location || ""}
              name="location"
            >
              {" "}
              <MenuItem value="">
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
          {/* </div> */}
          <div className="flex w-full flex-col items-center gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4">
            <AiOutlineCloudUpload />
            <div className="text-center">
              <h3 className="text-lg font-bold">Choose a model to upload</h3>
              <p>GLTF, GLB, OBJ, STL formats</p>
            </div>
            <label className="btn">
              <span>{modelName || "Browse Files"}</span>
              <input
                type="file"
                name="file"
                accept=".gltf, .glb, .obj, .stl"
                required
                className="hidden"
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div className="flex w-full flex-col items-center gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4">
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
                name="coverPicture"
                accept=".jpg, .jpeg, .png, .webp"
                className="hidden"
                onChange={handleInputChange}
              />
            </label>
          </div>

          <button
            className="my-3 w-full btn btn-neutral"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                sending...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
      <Successful
        text="Model added"
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </section>
  );
};

export default AddModel;
