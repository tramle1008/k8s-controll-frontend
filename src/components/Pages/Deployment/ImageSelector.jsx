import { useEffect, useState } from "react";
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    TextField,
    MenuItem,
    Typography,
} from "@mui/material";
import axios from "axios";

export default function ImageSelector({ onChange }) {
    const [source, setSource] = useState("dockerhub"); // dockerhub | registry
    const [dockerhubUser, setDockerhubUser] = useState("");
    const [dockerhubImages, setDockerhubImages] = useState([]);
    const [dockerhubTags, setDockerhubTags] = useState([]);

    const [registryRepos, setRegistryRepos] = useState([]);
    const [registryTags, setRegistryTags] = useState([]);

    const [selectedRepo, setSelectedRepo] = useState("");
    const [selectedTag, setSelectedTag] = useState("");

    // ----------------------
    // Load Registry repos
    // ----------------------
    useEffect(() => {
        if (source === "registry") {
            axios.get("http://localhost:8080/api/registry/repos")
                .then(res => setRegistryRepos(res.data))
                .catch(() => setRegistryRepos([]));
        }
    }, [source]);

    // ----------------------
    // DockerHub → Load repos
    // ----------------------
    const handleLoadDockerhubImages = () => {
        axios.get(`http://localhost:8080/api/dockerhub/images?link=https://hub.docker.com/u/${dockerhubUser}`)
            .then(res => setDockerhubImages(res.data))
            .catch(() => setDockerhubImages([]));
    };

    // ----------------------
    // DockerHub → Load tags
    // ----------------------
    const handleLoadDockerhubTags = (imageName) => {
        axios.get(`http://localhost:8080/api/dockerhub/tags?link=https://hub.docker.com/u/${dockerhubUser}&imageName=${imageName}`)
            .then(res => setDockerhubTags(res.data))
            .catch(() => setDockerhubTags([]));
    };

    // ----------------------
    // Registry → Load tags
    // ----------------------
    const handleLoadRegistryTags = (repo) => {
        axios.get(`http://localhost:8080/api/registry/tags?repo=${repo}`)
            .then(res => setRegistryTags(res.data))
            .catch(() => setRegistryTags([]));
    };

    // ----------------------
    // Build Image + PullPolicy
    // ----------------------
    useEffect(() => {
        let image = "";
        let policy = "";

        if (source === "dockerhub") {
            if (selectedRepo && selectedTag) {
                image = `${selectedRepo}:${selectedTag}`;
                policy = "IfNotPresent";
            }
        } else {
            if (selectedRepo && selectedTag) {
                image = `192.168.235.150:5000/${selectedRepo}:${selectedTag}`;
                policy = "Always";
            }
        }

        onChange?.({ image, imagePullPolicy: policy });

    }, [source, selectedRepo, selectedTag, onChange]);

    return (
        <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Image Source
            </Typography>

            {/* Toggle DockerHub / Registry */}
            <ToggleButtonGroup
                value={source}
                exclusive
                onChange={(e, val) => val && setSource(val)}
            >
                <ToggleButton value="dockerhub">DockerHub</ToggleButton>
                <ToggleButton value="registry">Local Registry</ToggleButton>
            </ToggleButtonGroup>

            {/* -------- DockerHub UI -------- */}
            {source === "dockerhub" && (
                <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="DockerHub Username"
                        value={dockerhubUser}
                        onChange={(e) => setDockerhubUser(e.target.value)}
                        onBlur={handleLoadDockerhubImages}
                    />

                    {/* Repo Selector */}
                    <TextField
                        select
                        label="Repository"
                        value={selectedRepo}
                        onChange={(e) => {
                            setSelectedRepo(e.target.value);
                            handleLoadDockerhubTags(e.target.value.split("/")[1]);
                        }}
                    >
                        {dockerhubImages.map((img, i) => (
                            <MenuItem key={i} value={img.fullName}>
                                {img.fullName}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Tag Selector */}
                    <TextField select label="Tag" value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
                        {dockerhubTags.map((tag, i) => (
                            <MenuItem key={i} value={tag.name}>
                                {tag.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            )}

            {/* -------- Registry UI -------- */}
            {source === "registry" && (
                <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Local Repo */}
                    <TextField
                        select
                        label="Local Repository"
                        value={selectedRepo}
                        onChange={(e) => {
                            setSelectedRepo(e.target.value);
                            handleLoadRegistryTags(e.target.value);
                        }}
                    >
                        {registryRepos.map((repo, i) => (
                            <MenuItem key={i} value={repo.name}>
                                {repo.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Local Tag */}
                    <TextField
                        select
                        label="Tag"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                    >
                        {registryTags.map((tag, i) => (
                            <MenuItem key={i} value={tag}>
                                {tag}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            )}
        </Box>
    );
}