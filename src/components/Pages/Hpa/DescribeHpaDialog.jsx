import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";


import { Separator } from "@/components/ui/separator";
import { Badge } from "@mui/material";




export default function DescribeHpaDialog({ open, onClose, data }) {

    if (!data) return null;

    const renderStatus = (status) => {
        if (status === "True") return <p>True</p>;
        if (status === "False") return <p variant="destructive">False</p>;
        return <Badge variant="secondary">{status}</Badge>;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-amber-50">

                <DialogHeader>
                    <DialogTitle>
                        HPA: {data.name}
                    </DialogTitle>
                </DialogHeader>

                {/* Basic info */}
                <div className="space-y-2 text-sm">

                    <div>
                        <b>Namespace:</b> {data.namespace}
                    </div>

                    <div>
                        <b>Reference:</b> {data.reference}
                    </div>

                    <div>
                        <b>Created:</b> {new Date(data.creationTimestamp).toLocaleString()}
                    </div>

                </div>

                <Separator />

                {/* Metrics */}
                <div className="space-y-2">
                    <h3 className="font-semibold">Metrics</h3>

                    {data.metrics ? (
                        <div className="text-sm">{data.metrics}</div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            No metrics available
                        </div>
                    )}
                </div>

                <Separator />

                {/* Replica info */}
                <div className="space-y-2 text-sm">

                    <div>
                        <b>Pods:</b> {data.pods}
                    </div>

                    <div>
                        <b>Min replicas:</b> {data.minReplicas}
                    </div>

                    <div>
                        <b>Max replicas:</b> {data.maxReplicas}
                    </div>

                </div>

                <Separator />

                {/* Conditions */}
                <div className="space-y-3 ">

                    <h3 className="font-semibold">Conditions</h3>

                    {data.conditions?.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                            No conditions
                        </div>
                    )}

                    {data.conditions?.map((c, i) => (
                        <div
                            key={i}
                            className="border rounded-md p-3 space-y-1 text-sm bg-white"
                        >

                            <div className="flex items-center gap-2">
                                <b>{c.type}</b>
                                {renderStatus(c.status)}
                            </div>

                            <div>
                                <b>Reason:</b> {c.reason}
                            </div>

                            <div className="text-muted-foreground">
                                {c.message}
                            </div>

                        </div>
                    ))}

                </div>

            </DialogContent>
        </Dialog>
    );
}