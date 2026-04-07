import { DataGrid } from "@mui/x-data-grid";

const ResourceTable = ({ rows, columns, getRowId }) => {
    return (
        <DataGrid
            rows={rows}
            columns={columns}
            getRowId={getRowId}
            pageSizeOptions={[10, 20, 50, 100]}
            initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
            }}
            disableRowSelectionOnClick
            autoHeight
            density="compact"
        />
    );
};

export default ResourceTable;