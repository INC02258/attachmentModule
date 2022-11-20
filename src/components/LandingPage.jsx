import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  FormControlLabel,
  Paper
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { FileUploader } from "react-drag-drop-files";
import "./LandingPage.css";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';

const LandingPage = () => {
  const fileTypes = ["JPEG", "PNG", "GIF", "PDF"];
  // const [file, setFile] = useState(null);
  const [allFiles, setallFiles] = useState([]);

  const getAllDocs = async () => {
    const response = await fetch(
      "https://attachmentmodule.cfapps.ap21.hana.ondemand.com/document/documents"
    );
    const data = await response.json();
    setallFiles(data);
  };

  // const handleChange = (file) => {
  //   setFile(file);
  //   const formData = new FormData();
  //   formData.append('files', file)
  //   console.log(file);
  //   axios({
  //     url: `https://attachmentmodule.cfapps.ap21.hana.ondemand.com/document/upload`,
  //     method: 'POST',
  //     data: formData
  //   }).then((res) => console.log(res.data))
  // };

  const [selectedFile, setSelectedFile] = React.useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData();
    for (let i = 0; i < selectedFile.length; i++) {
      formData.append('files', selectedFile[i]);
    }
    // formData.append("files", selectedFile);
    try {
      const response = await axios({
        method: "post",
        url: "https://attachmentmodule.cfapps.ap21.hana.ondemand.com/document/upload",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }).then((res)=>getAllDocs());
    } catch (error) {
      console.log(error)
    }
  }

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files)
  }

  //DELETE FUNCTION
  const MatDelete = ({ id }) => {
    const handleDelClick = async () => {
      axios({
        url: `https://attachmentmodule.cfapps.ap21.hana.ondemand.com/document/delete/${id}`,
        method: 'DELETE'
      }).then((res) => getAllDocs())
    }

    return (
      <FormControlLabel
        control={
          <IconButton onClick={handleDelClick}>
            <Tooltip title="Delete">
              <DeleteIcon />
            </Tooltip>
          </IconButton>
        }
      />
    );
  }

  //DOWNLOAD FUNCTION
  const MatDownload = ({ id, name }) => {
    const handleDownloadClick = async () => {

      axios({
        url: `https://attachmentmodule.cfapps.ap21.hana.ondemand.com/document/download/${id}`,
        method: "GET",
        responseType: "blob",
      }).then((response) => {
        const href = URL.createObjectURL(response.data);

        const link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", `${name}`);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(href);
      });
    };
    return (
      <FormControlLabel
        control={
          <IconButton onClick={handleDownloadClick}>
            <Tooltip title="Download">
              <FileDownloadOutlinedIcon />
            </Tooltip>
          </IconButton>
        }
      />
    );
  };

  //COLUMNS
  const columns = [
    {
      field: "filename",
      headerName: "Attachment Name",
      flex: 1,
      editable: true,
    },
    {
      field: "fileType",
      headerName: "Attachment Type",
      flex: 1,
      editable: true,
    },
    {
      field: "fileSize",
      headerName: "Attachment Size (In KB)",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Actions",

      flex: 1,
      editable: true,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => {
        return (
          <div style={{ cursor: "pointer" }}>
            <MatDownload id={params.row.id} name={params.row.filename} />
            <MatDelete id={params.row.id} />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getAllDocs();
  }, []);

  return (
    <Box m={1} p={2} backgroundColor="#fafcff" height="100vh">
      <Stack>
        <Typography variant="h4">Attachment Module Project</Typography>
        <Box width="50%" pl={50} mt={2} mb={0}>
          <Box component={Paper} p={2} width="300px">
            <Typography variant='h6' mb={1}>Upload Files Here</Typography>
          <form onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileSelect} multiple style={{marginBottom:'5px'}}/>
            <input type="submit" value="Upload File" />
          </form>
          </Box>

          {/* <FileUploader
            multiple={true}
            handleChange={handleChange}
            name="file"
            types={fileTypes}
          /> */}

          {/* <Typography variant="subtitle2">
            Show Uploading Percentage Here
          </Typography> */}
          {/* <Typography variant='subtitle2'>{file ? `File name: ${file[0].name}` : "no files uploaded yet"}</Typography> */}
        </Box>
        <Typography variant="h6" mb={1} mt={3}>
          List of Attachments ({allFiles.length})
        </Typography>
        <Box sx={{ height: 370, width: "100%" }}>
          <DataGrid
            rows={allFiles}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default LandingPage;
