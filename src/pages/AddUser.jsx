// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { customFetch } from "../utils";
import { toast } from "react-toastify";
import { Successful } from "../components";
import { Upload, UserPlus, Eye, EyeOff } from "lucide-react"; // Import icons


// Import shadcn components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { getUserFromLocalStorage } from "@/redux/reducers/userReducer";
import { useNavigate } from "react-router-dom";


const AddUser = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    role: "",
    image: "",
    location: "",
  });
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageName, setImageName] = useState("");
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    const pageViewer = getUserFromLocalStorage()
    if (pageViewer?.role !== "superAdmin") {
      toast.error("You are not permitted to view this page")
      navigate(-1)
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append("fullname", formData.fullname);
      formDataForUpload.append("username", formData.username);
      formDataForUpload.append("email", formData.email);
      formDataForUpload.append("password", formData.password);
      formDataForUpload.append("role", formData.role);
      formDataForUpload.append("image", formData.image);
      formDataForUpload.append("location", formData.location);

      const response = await customFetch.post(
        "/user/register-tagger",
        formDataForUpload
      );
      if (response.data?.status !== "error") {
        toast.success(`User added successfully`);
      } else {
        toast.error(response.data?.message);
      }
      setImageName("");
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || "Error adding user";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="py-8">
      <Card className="mx-auto max-w-2xl bg-white shadow-md">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-[#021431]/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Add New User</CardTitle>
          <p className="text-center text-gray-500 font-[400]">
            Please enter new user details
          </p>
        </CardHeader>

        <CardContent>
          <form encType="multipart/form-data" className="space-y-4">
            {/* Form fields */}
            <div className="space-y-2">
              <Label className="text-gray-700">Full Name</Label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full h-11 px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#021431] focus:border-transparent"
                required
              />
            </div>

            {/* Username field */}
            <div className="space-y-2">
              <Label className="text-gray-700">Username</Label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full h-11 px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#021431] focus:border-transparent"
                required
              />
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label className="text-gray-700">Email</Label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full h-11 px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#021431] focus:border-transparent"
                required
              />
            </div>

            {/* Password field with toggle */}
            <div className="space-y-2">
              <Label className="text-gray-700">Password</Label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full h-11 px-3 py-2 pr-10 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#021431] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-gray-700">User Role</Label>
              <Select
                name="role"
                value={formData.role}
                onValueChange={(value) => handleChange({ target: { name: 'role', value } })}
              >
                <SelectTrigger className="w-full h-11 border-gray-400 bg-white focus:ring-2 focus:ring-[#021431] focus:border-transparent">
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem
                    value="tagger"
                    className="hover:bg-[#021431] hover:text-white focus:bg-[#021431] focus:text-white"
                  >
                    Sampler
                  </SelectItem>
                  <SelectItem
                    value="reviewer"
                    className="hover:bg-[#021431] hover:text-white focus:bg-[#021431] focus:text-white"
                  >
                    Reviewer
                  </SelectItem>
                  <SelectItem
                    value="admin"
                    className="hover:bg-[#021431] hover:text-white focus:bg-[#021431] focus:text-white"
                  >
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <Label className="text-gray-700">Location</Label>
              <Select
                name="location"
                value={formData.location}
                onValueChange={(value) => handleChange({ target: { name: 'location', value } })}
              >
                <SelectTrigger className="w-full h-11 border-gray-400 bg-white focus:ring-2 focus:ring-[#021431] focus:border-transparent">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {locations.map((item, index) => (
                    <SelectItem
                      key={index}
                      value={item.value}
                      className="hover:bg-[#021431] hover:text-white focus:bg-[#021431] focus:text-white"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-gray-700">Profile Image</Label>
              <div className="flex flex-col items-center gap-y-2 w-full rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-6 hover:bg-gray-50 transition-colors">
                <div className="h-12 w-12 rounded-full bg-[#021431]/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-500" />
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-lg font-bold text-gray-700">
                    Choose a profile photo
                  </h3>
                  <p className="text-sm text-gray-500">JPEG, PNG up to 2MB</p>
                </div>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    type="button"
                    className="hover:bg-[#021431] hover:text-white transition-colors"
                  >
                    {imageName || "Browse Files"}
                  </Button>
                  <input
                    type="file"
                    name="image"
                    accept=".jpg, .jpeg, .png, .webp"
                    className="hidden"
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              type="submit"
              className="w-full h-11 bg-[#021431] hover:bg-[#021431]/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  <span>Adding User...</span>
                </div>
              ) : (
                "Add User"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Successful
        text="User added successfully"
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </div>
  );
};

export default AddUser;