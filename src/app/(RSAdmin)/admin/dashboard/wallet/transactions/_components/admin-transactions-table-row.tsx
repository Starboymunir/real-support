import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import ListItemText from "@mui/material/ListItemText";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";
import { IAdminTransaction } from "@/types/type";

export default function TransactionsTableRow({ row }: {
  row: IAdminTransaction;
}) {

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {row.userInfo ? (
            <>
              <AwsImageAvatar
                imageKey={row?.userInfo?.coverImage}
                alt={row?.userInfo?.firstName}
                width={50}
                height={50}
              />
              <ListItemText
                primary={
                  row?.userInfo?.firstName + " " + row?.userInfo?.lastName
                }
                secondary={row?.userInfo?.emailAddress}
                primaryTypographyProps={{ typography: "body2" }}
                secondaryTypographyProps={{
                  component: "span",
                  color: "text.disabled",
                }}
              />
            </>
          ) : (
            "-"
          )}
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.type}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.amount}</TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.narration}</TableCell>
      </TableRow>
    </>
  );
}