import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

import {
    fetchDockerHubRepos,
    fetchDockerHubTags,
    fetchLocalRepos,
    fetchLocalTags,
} from "../../../api/imageApi";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectNamespaces } from "../../../store/reducers/slices/namespaceProductSlice";
import UploadImageDialog from "../Manager/UploadImageDialog";

export default function CreateDeploymentDialog({
    open,
    onClose,
    onCreate,
}) {
    const [imageSource, setImageSource] = useState("official");
    const [imageRepos, setImageRepos] = useState([]);
    const [tags, setTags] = useState([]);
    const { list = [] } = useSelector(state => state.namespaceProduct);
    const dispatch = useDispatch();
    const [selectedRepo, setSelectedRepo] = useState("");
    const [selectedTag, setSelectedTag] = useState("");
    const [containerEdited, setContainerEdited] = useState(false);

    // ------------------------------
    // FORM STATE
    // ------------------------------
    const [form, setForm] = useState({
        name: "",
        namespace: "default",
        replicas: 1,
        dockerUser: "",
        container: {
            name: "",
            image: "",
            imagePullPolicy: "Always",
        },
    });
    const [ports, setPorts] = useState([""]);
    const [envVars, setEnvVars] = useState([]);
    const [labels, setLabels] = useState([
        { key: "app", value: "" }
    ]);

    const [volumeMounts, setVolumeMounts] = useState([]);
    const [resources, setResources] = useState({
        requests: { cpu: "250m", memory: "256Mi" },
        limits: { cpu: "500m", memory: "512Mi" },
    });
    const [volumes, setVolumes] = useState([]);

    // ------------------------------
    // HELPERS
    // ------------------------------

    const [showUploadDialog, setShowUploadDialog] = useState(false);

    const handleLocalRepoChange = (value) => {
        if (value === "__upload__") {
            setShowUploadDialog(true);
            return;
        }
        setSelectedRepo(value);
    };

    const updateField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const updateContainer = (key, value) => {
        setForm(prev => ({
            ...prev,
            container: {
                ...prev.container,
                [key]: value,
            },
        }));
    };

    const handleNameChange = (value) => {
        updateField("name", value); // cập nhật form.name

        setLabels(prev => {
            const clone = [...prev];
            const appLabelIdx = clone.findIndex(l => l.key === "app");
            if (appLabelIdx >= 0) {
                clone[appLabelIdx].value = value; // tự động set giá trị app
            } else {
                clone.push({ key: "app", value }); // thêm nếu chưa có
            }
            return clone;
        });


        // Cập nhật container name nếu chưa chỉnh sửa
        if (!containerEdited) {
            setForm(prev => ({
                ...prev,
                container: { ...prev.container, name: value }
            }));
        }

    };
    const handleContainerChange = (value) => {
        setForm(prev => ({
            ...prev,
            container: { ...prev.container, name: value }
        }));
        setContainerEdited(true);
    };

    // ------------------------------
    // LOAD REPO
    // ------------------------------
    useEffect(() => {
        if (imageSource === "registry") {
            fetchLocalRepos().then(setImageRepos);
        } else {
            if (form.dockerUser) {
                fetchDockerHubRepos(form.dockerUser).then(setImageRepos);
            }
        }
    }, [imageSource, form.dockerUser]);
    // LOAD NAMESPACE
    useEffect(() => {
        dispatch(fetchProjectNamespaces());
    }, [dispatch]);

    // ------------------------------
    // HANDLE REPO SELECT
    // ------------------------------
    const handleRepoChange = (repo) => {
        setSelectedRepo(repo);
        setSelectedTag("");
        setTags([]);

        if (imageSource === "registry") {
            const cleanRepo = repo.replace("192.168.235.150:5000/", "");
            fetchLocalTags(cleanRepo).then(setTags);
        } else {
            const link = `https://hub.docker.com/u/${form.dockerUser}`;
            fetchDockerHubTags(link, repo).then(setTags);
        }

    };


    // ------------------------------
    // HANDLE TAG SELECT
    // ------------------------------
    const handleTagChange = (tag) => {
        setSelectedTag(tag);

        // Handle OFFICIAL images first
        if (imageSource === "official") {
            updateContainer("image", `${form.container.name}:${tag}`);
            updateContainer("imagePullPolicy", "Always");
            return;
        }

        // Handle custom DockerHub / Registry
        let img = "";
        let pullPolicy = "";

        if (imageSource === "registry") {
            img = `${selectedRepo}:${tag}`;
            pullPolicy = "Always";
        } else if (imageSource === "dockerhub") {
            img = `${form.dockerUser}/${selectedRepo}:${tag}`;
            pullPolicy = "IfNotPresent";
        }

        updateContainer("image", img);
        updateContainer("imagePullPolicy", pullPolicy);
    };

    // ------------------------------
    // BUILD PAYLOAD
    // ------------------------------
    const buildPayload = () => {
        // convert label array => object
        const labelObj = {};
        labels.forEach(l => {
            if (l.key.trim() !== "") {
                labelObj[l.key] = l.value;
            }
        });

        return {
            apiVersion: "apps/v1",
            kind: "Deployment",
            metadata: {
                name: form.name,
                namespace: form.namespace,
                labels: labelObj,
            },
            spec: {
                replicas: Number(form.replicas),
                selector: {
                    matchLabels: labelObj
                },
                template: {
                    metadata: { labels: labelObj },
                    spec: {
                        containers: [
                            {
                                name: form.container.name || form.name,
                                image: form.container.image,
                                imagePullPolicy: form.container.imagePullPolicy,
                                ports: ports.map(p => ({ containerPort: Number(p) })),
                                env: envVars
                                    .filter(e => e.name.trim() !== "")
                                    .map(e => ({ name: e.name, value: e.value })),
                                volumeMounts: volumeMounts
                                    .filter(v => v.name.trim() !== "")
                                    .map(v => ({
                                        name: v.name,
                                        mountPath: v.mountPath
                                    })),
                                resources: {
                                    requests: {
                                        cpu: resources.requests.cpu,
                                        memory: resources.requests.memory
                                    },
                                    limits: {
                                        cpu: resources.limits.cpu,
                                        memory: resources.limits.memory
                                    }
                                }
                            }
                        ],
                        volumes: volumes
                            .filter(v => v.name.trim() !== "")
                            .map(v => {
                                const base = { name: v.name };

                                if (v.type === "configMap") {
                                    return {
                                        ...base,
                                        configMap: { name: v.configMap }
                                    };
                                }

                                if (v.type === "pvc") {
                                    return {
                                        ...base,
                                        persistentVolumeClaim: { claimName: v.pvc }
                                    };
                                }

                                return base;
                            })
                    }
                }
            }
        };
    };

    // ------------------------------
    // SUBMIT
    // ------------------------------
    const handleSubmit = () => {
        const payload = buildPayload();
        onCreate(payload);
        onClose();
    };

    // ------------------------------
    // RENDER
    // ------------------------------
    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl bg-white max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Deployment</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">

                        {/* NAME */}
                        <div>
                            <Label>Deployment Name</Label>
                            <Input
                                value={form.name}
                                placeholder="deployment name"
                                onChange={e => handleNameChange(e.target.value)}
                            />
                        </div>
                        {/* NAMESPACE */}
                        <div>
                            <Label>Namespace</Label>
                            <Select
                                value={form.namespace}
                                onValueChange={(v) => updateField("namespace", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Namespace" />
                                </SelectTrigger>
                                <SelectContent>
                                    {list.map(ns => (
                                        <SelectItem key={ns} value={ns}>
                                            {ns}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* REPLICAS */}
                        <div>
                            <Label>Replicas</Label>
                            <Input
                                type="number"
                                value={form.replicas}
                                onChange={e => updateField("replicas", e.target.value)}
                            />
                        </div>
                        {/* LABELS */}
                        <div>
                            <Label>Labels</Label>

                            {labels.map((lb, idx) => (
                                <div key={idx} className="flex gap-2 mt-2">
                                    <Input
                                        placeholder="app"
                                        value={lb.key}
                                        onChange={e => {
                                            const clone = [...labels];
                                            clone[idx].key = e.target.value;
                                            setLabels(clone);
                                        }}
                                    />
                                    <Input
                                        placeholder="medical-service"
                                        value={lb.value}
                                        onChange={e => {
                                            const clone = [...labels];
                                            clone[idx].value = e.target.value;
                                            setLabels(clone);
                                        }}
                                    />
                                    <Button
                                        variant="destructive"
                                        onClick={() => setLabels(labels.filter((_, i) => i !== idx))}
                                    >
                                        X
                                    </Button>
                                </div>
                            ))}

                            <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() => setLabels([...labels, { key: "", value: "" }])}
                            >
                                + Add Label
                            </Button>
                        </div>
                        {/* IMAGE SOURCE SWITCH */}
                        <div className="flex gap-3">
                            <Button
                                variant={imageSource === "dockerhub" ? "default" : "outline"}
                                onClick={() => setImageSource("dockerhub")}
                            >
                                DockerHub (User)
                            </Button>

                            <Button
                                variant={imageSource === "registry" ? "default" : "outline"}
                                onClick={() => setImageSource("registry")}
                            >
                                Local Registry
                            </Button>

                            <Button
                                variant={imageSource === "official" ? "default" : "outline"}
                                onClick={() => setImageSource("official")}
                            >
                                Docker Official
                            </Button>
                        </div>
                        {/* DOCKER HUB BLOCK */}
                        {imageSource === "dockerhub" && (
                            <div className="space-y-4 p-4 border rounded-md bg-slate-50">
                                <Label>DockerHub Username</Label>
                                <Input
                                    placeholder="tramle792"
                                    value={form.dockerUser}
                                    onChange={e => updateField("dockerUser", e.target.value)}
                                />

                                <Label>Repository</Label>
                                <Select value={selectedRepo} onValueChange={handleRepoChange}>
                                    <SelectTrigger><SelectValue placeholder="Select Repo" /></SelectTrigger>
                                    <SelectContent>
                                        {imageRepos.map((r) => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Label>Tag</Label>
                                <Select value={selectedTag} onValueChange={handleTagChange}>
                                    <SelectTrigger><SelectValue placeholder="Select Tag" /></SelectTrigger>
                                    <SelectContent>
                                        {tags.map((t) => (
                                            <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* LOCAL REGISTRY BLOCK */}
                        {imageSource === "registry" && (
                            <div className="space-y-4 p-4 border rounded-md bg-slate-50">
                                <Label>Local Repository</Label>
                                <Select value={selectedRepo} onValueChange={handleLocalRepoChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Repo" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {imageRepos.map((r) => (
                                            <SelectItem
                                                key={r}
                                                value={`192.168.235.150:5000/${r}`}
                                            >
                                                {r}
                                            </SelectItem>
                                        ))}

                                        {/* ⭐ Option đặc biệt */}
                                        <SelectItem
                                            value="__upload__"
                                            className="text-blue-600 font-semibold"
                                        >
                                            + Upload New Image
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Label>Tag</Label>
                                <Select value={selectedTag} onValueChange={handleTagChange}>
                                    <SelectTrigger><SelectValue placeholder="Select Tag" /></SelectTrigger>
                                    <SelectContent>
                                        {tags.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {/* OFFICAL SOURCE */}
                        {imageSource === "official" && (
                            <div className="space-y-4 p-4 border rounded-md bg-slate-50">
                                <Label>Official Image</Label>
                                <Input
                                    placeholder="nginx, kong, redis, postgres"
                                    value={form.container.image.split(":")[0]} // chỉ hiển thị tên image
                                    onChange={(e) => {
                                        const tag = selectedTag || "latest";
                                        updateContainer("image", `${e.target.value}:${tag}`);
                                    }}
                                />

                                <Label>Tag</Label>
                                <Input
                                    placeholder="latest, 3.6, alpine"
                                    value={selectedTag}
                                    onChange={(e) => {
                                        setSelectedTag(e.target.value);
                                        updateContainer("image", `${form.container.image.split(":")[0]}:${e.target.value}`);
                                        updateContainer("imagePullPolicy", "Always");
                                    }}
                                />
                            </div>
                        )}

                        {/* CONTAINER NAME */}

                        <div>
                            <Label>Container Name</Label>
                            <Input
                                value={form.container.name}
                                placeholder="my-container"
                                onChange={e => handleContainerChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Container Ports</Label>

                            {ports.map((p, idx) => (
                                <div key={idx} className="flex gap-2 mt-1">
                                    <Input
                                        type="number"
                                        value={p}
                                        onChange={e => {
                                            const clone = [...ports];
                                            clone[idx] = e.target.value;
                                            setPorts(clone);
                                        }}
                                        placeholder="8000"
                                    />
                                    <Button
                                        variant="destructive"
                                        onClick={() => setPorts(ports.filter((_, i) => i !== idx))}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}

                            <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() => setPorts([...ports, ""])}
                            >
                                + Add Port
                            </Button>
                        </div>

                        {/* ENVIRONMENT VARIABLES */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center">
                                <Label>Environment Variables</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEnvVars([...envVars, { name: "", value: "" }])}
                                >
                                    + Add ENV
                                </Button>
                            </div>

                            {envVars.map((env, idx) => (
                                <div key={idx} className="flex gap-2 mt-2">
                                    <Input
                                        placeholder="KEY"
                                        value={env.name}
                                        onChange={e => {
                                            const c = [...envVars];
                                            c[idx].name = e.target.value;
                                            setEnvVars(c);
                                        }}
                                    />
                                    <Input
                                        placeholder="VALUE"
                                        value={env.value}
                                        onChange={e => {
                                            const c = [...envVars];
                                            c[idx].value = e.target.value;
                                            setEnvVars(c);
                                        }}
                                    />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setEnvVars(envVars.filter((_, i) => i !== idx))}
                                    >
                                        X
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* VOLUME MOUNTS */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center">
                                <Label>Volume Mounts</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setVolumeMounts([...volumeMounts, { name: "", mountPath: "" }])}
                                >
                                    + Add
                                </Button>
                            </div>

                            {volumeMounts.map((vm, idx) => (
                                <div key={idx} className="flex gap-2 mt-2">
                                    <Input
                                        placeholder="volume name"
                                        value={vm.name}
                                        onChange={e => {
                                            const c = [...volumeMounts];
                                            c[idx].name = e.target.value;
                                            setVolumeMounts(c);
                                        }}
                                    />
                                    <Input
                                        placeholder="mountPath (/path)"
                                        value={vm.mountPath}
                                        onChange={e => {
                                            const c = [...volumeMounts];
                                            c[idx].mountPath = e.target.value;
                                            setVolumeMounts(c);
                                        }}
                                    />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setVolumeMounts(volumeMounts.filter((_, i) => i !== idx))}
                                    >
                                        X
                                    </Button>
                                </div>
                            ))}
                        </div>



                        {/* VOLUMES */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center">
                                <Label>Volumes</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setVolumes([...volumes, { name: "", type: "configMap", configMap: "", pvc: "" }])
                                    }
                                >
                                    + Add Volume
                                </Button>
                            </div>

                            {volumes.map((v, idx) => (
                                <div key={idx} className="space-y-2 mt-2 p-3 border rounded-md">
                                    <Input
                                        placeholder="volume name"
                                        value={v.name}
                                        onChange={e => {
                                            const c = [...volumes];
                                            c[idx].name = e.target.value;
                                            setVolumes(c);
                                        }}
                                    />

                                    <Select
                                        value={v.type}
                                        onValueChange={val => {
                                            const c = [...volumes];
                                            c[idx].type = val;
                                            setVolumes(c);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Volume Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="configMap">ConfigMap</SelectItem>
                                            <SelectItem value="pvc">PersistentVolumeClaim</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {v.type === "configMap" && (
                                        <Input
                                            placeholder="configMap name"
                                            value={v.configMap}
                                            onChange={e => {
                                                const c = [...volumes];
                                                c[idx].configMap = e.target.value;
                                                setVolumes(c);
                                            }}
                                        />
                                    )}

                                    {v.type === "pvc" && (
                                        <Input
                                            placeholder="PVC claimName"
                                            value={v.pvc}
                                            onChange={e => {
                                                const c = [...volumes];
                                                c[idx].pvc = e.target.value;
                                                setVolumes(c);
                                            }}
                                        />
                                    )}

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setVolumes(volumes.filter((_, i) => i !== idx))}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label>Resources</Label>

                            <div className="mt-2 grid grid-cols-2 gap-4">
                                {/* CPU Requests */}
                                <div className="flex flex-col">
                                    <Label>CPU Requests</Label>
                                    <Input
                                        value={resources.requests.cpu}
                                        onChange={e =>
                                            setResources(prev => ({
                                                ...prev,
                                                requests: { ...prev.requests, cpu: e.target.value }
                                            }))
                                        }
                                        placeholder="250m"
                                    />
                                </div>

                                {/* Memory Requests */}
                                <div className="flex flex-col">
                                    <Label>Memory Requests</Label>
                                    <Input
                                        value={resources.requests.memory}
                                        onChange={e =>
                                            setResources(prev => ({
                                                ...prev,
                                                requests: { ...prev.requests, memory: e.target.value }
                                            }))
                                        }
                                        placeholder="256Mi"
                                    />
                                </div>

                                {/* CPU Limits */}
                                <div className="flex flex-col">
                                    <Label>CPU Limits</Label>
                                    <Input
                                        value={resources.limits.cpu}
                                        onChange={e =>
                                            setResources(prev => ({
                                                ...prev,
                                                limits: { ...prev.limits, cpu: e.target.value }
                                            }))
                                        }
                                        placeholder="500m"
                                    />
                                </div>

                                {/* Memory Limits */}
                                <div className="flex flex-col">
                                    <Label>Memory Limits</Label>
                                    <Input
                                        value={resources.limits.memory}
                                        onChange={e =>
                                            setResources(prev => ({
                                                ...prev,
                                                limits: { ...prev.limits, memory: e.target.value }
                                            }))
                                        }
                                        placeholder="512Mi"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleSubmit}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <UploadImageDialog
                open={showUploadDialog}
                onClose={() => setShowUploadDialog(false)}
                onUploaded={() => {
                    setShowUploadDialog(false);

                    // Reload danh sách repo
                    fetchLocalRepos();

                    // Reload tags của repo hiện chọn
                    if (selectedRepo) {
                        handleRepoChange(selectedRepo);
                    }
                }}
            />
        </>
    );
}