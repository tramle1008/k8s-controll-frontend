// src/api/imageApi.js
import axios from "axios";

const BASE = "http://localhost:8080/api";

// =========================
// 🔵 DOCKER HUB
// =========================

// GET dockerhub repos
export const fetchDockerHubRepos = async (username) => {
    if (!username) return [];
    const url = `${BASE}/dockerhub/images?link=https://hub.docker.com/u/${username}`;
    const res = await axios.get(url);
    return res.data.map((item) => item.imageName); // chỉ return name
};

// GET dockerhub tags
export const fetchDockerHubTags = async (link, imageName) => {
    const res = await axios.get(
        `/api/dockerhub/tags`,
        { params: { link, imageName } }
    );
    return res.data;
};

// =========================
// 🔵 LOCAL REGISTRY
// =========================

// GET local registry repos
export const fetchLocalRepos = async () => {
    const url = `${BASE}/registry/repos`;
    const res = await axios.get(url);

    return res.data.map(r => r.name); // <--- lấy đúng string repo
};

// GET tags from local registry
export const fetchLocalTags = async (repoName) => {
    const url = `${BASE}/registry/tags?repo=${repoName}`;
    const res = await axios.get(url);
    return res.data;
};