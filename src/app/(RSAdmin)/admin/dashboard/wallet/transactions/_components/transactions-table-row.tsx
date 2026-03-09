import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import ListItemText from "@mui/material/ListItemText";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";

interface TransactionsTableRowProps {
  row: {
    id: string,
    type: string,
    amount: string,
    senderInfo: {
      firstName: string,
      lastName: string,
      emailAddress: string,
      coverImage: string,
    } | null,
    stripeId: string,
    receiverInfo: {
      firstName: string,
      lastName: string,
      emailAddress: string,
      coverImage: string,
    } | null,
  },
}

export default function TransactionsTableRow({
  row,
}: TransactionsTableRowProps) {
  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.type}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>£ {row?.amount}</TableCell>

        <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {row.senderInfo ? (
            <>
              <AwsImageAvatar
                imageKey={row.senderInfo.coverImage}
                alt={row.senderInfo.firstName}
                width={50}
                height={50}
              />
              <ListItemText
                primary={
                  row?.senderInfo?.firstName + " " + row?.senderInfo?.lastName
                }
                secondary={row?.senderInfo?.emailAddress}
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
        <TableCell sx={{ whiteSpace: "nowrap" }}>{row?.stripeId}</TableCell>

        <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {row?.receiverInfo ? (
            <>
              <AwsImageAvatar
                imageKey={row?.receiverInfo?.coverImage}
                alt={row?.receiverInfo?.firstName}
                width={50}
                height={50}
              />
              <ListItemText
                primary={
                  row?.receiverInfo?.firstName +
                  " " +
                  row?.receiverInfo?.lastName
                }
                secondary={row?.receiverInfo?.emailAddress}
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
      </TableRow>
    </>
  );
}
