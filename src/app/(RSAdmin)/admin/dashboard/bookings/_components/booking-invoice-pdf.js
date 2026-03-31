import { useMemo } from "react";
import {
  Page,
  View,
  Text,
  Image,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

import { fDate } from "@/lib/utils/format-time";
import { fCurrency } from "@/lib/utils/format-number";

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        col4: { width: "25%" },
        col8: { width: "75%" },
        col6: { width: "50%" },
        mb4: { marginBottom: 4 },
        mb8: { marginBottom: 8 },
        mb40: { marginBottom: 40 },
        h3: { fontSize: 16, fontWeight: 700 },
        h4: { fontSize: 13, fontWeight: 700 },
        body1: { fontSize: 10 },
        body2: { fontSize: 9 },
        subtitle1: { fontSize: 10, fontWeight: 700 },
        subtitle2: { fontSize: 9, fontWeight: 700 },
        alignRight: { textAlign: "right" },
        page: {
          fontSize: 9,
          lineHeight: 1.6,
          fontFamily: "Helvetica",
          backgroundColor: "#FFFFFF",
          textTransform: "capitalize",
          padding: "40px 24px 120px 24px",
        },
        footer: {
          left: 0,
          right: 0,
          bottom: 0,
          padding: 24,
          margin: "auto",
          borderTopWidth: 1,
          borderStyle: "solid",
          position: "absolute",
          borderColor: "#DFE3E8",
        },
        gridContainer: {
          flexDirection: "row",
          justifyContent: "space-between",
        },
        table: {
          display: "flex",
          width: "auto",
        },
        tableRow: {
          padding: "8px 0",
          flexDirection: "row",
          borderBottomWidth: 1,
          borderStyle: "solid",
          borderColor: "#DFE3E8",
        },
        noBorder: {
          paddingTop: 8,
          paddingBottom: 0,
          borderBottomWidth: 0,
        },
        tableCell_1: {
          width: "5%",
        },
        tableCell_2: {
          width: "50%",
          paddingRight: 16,
        },
        tableCell_3: {
          width: "15%",
        },
      }),
    []
  );

export default function InvoicePDF({ invoice }) {
  const { id, status, riderInfo, driverInfo, bookingDate, bookingTime } =
    invoice || {};

  const styles = useStyles();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.gridContainer, styles.mb40]}>
          <Image
            alt="Logo"
            source="/assets/logo.png"
            style={{ width: 48, height: 48 }}
          />

          <View style={{ alignItems: "flex-end", flexDirection: "column" }}>
            <Text style={styles.h3}>{status}</Text>
            <Text>Booking ID: {id} </Text>
          </View>
        </View>

        <View style={[styles.gridContainer, styles.mb40]}>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Passenger:</Text>
            <Text style={styles.body2}>{riderInfo?.firstName}</Text>
            <Text style={styles.body2}>{riderInfo?.emailAddress}</Text>
            <Text style={styles.body2}>{riderInfo?.phone_number}</Text>
          </View>

          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Driver:</Text>
            <Text style={styles.body2}>{driverInfo?.userInfo?.firstName}</Text>
            <Text style={styles.body2}>
              {driverInfo?.userInfo?.emailAddress}
            </Text>
            <Text style={styles.body2}>
              {driverInfo?.userInfo?.phone_number}
            </Text>
          </View>
        </View>

        <View style={[styles.gridContainer, styles.mb40]}>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Date</Text>
            <Text style={styles.body2}>{fDate(bookingDate)}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Time</Text>
            <Text style={styles.body2}>{bookingTime}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Total Duration</Text>
            <Text style={styles.body2}>{invoice?.totalDuration}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Total Distance</Text>
            <Text style={styles.body2}>{invoice?.totalDistance}</Text>
          </View>
        </View>

        <View style={[styles.gridContainer, styles.mb40]}>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Start Form:</Text>
            <Text style={styles.body2}>{invoice?.startFrom?.name}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Destination:</Text>
            <Text style={styles.body2}>{invoice?.destination?.name}</Text>
          </View>
        </View>

        <View style={[styles.tableRow, styles.noBorder]}>
          <View style={styles.tableCell_1} />
          <View style={styles.tableCell_2} />
          <View style={styles.tableCell_3} />
          <View style={styles.tableCell_3}>
            <Text>Payment Type</Text>
          </View>
          <View style={[styles.tableCell_3, styles.alignRight]}>
            <Text>{invoice?.paymentType}</Text>
          </View>
        </View>

        <View style={[styles.tableRow, styles.noBorder]}>
          <View style={styles.tableCell_1} />
          <View style={styles.tableCell_2} />
          <View style={styles.tableCell_3} />
          <View style={styles.tableCell_3}>
            <Text>Discount Amount</Text>
          </View>
          <View style={[styles.tableCell_3, styles.alignRight]}>
            <Text>{fCurrency(invoice?.discountAmount || 0)}</Text>
          </View>
        </View>
        <View style={[styles.tableRow, styles.noBorder]}>
          <View style={styles.tableCell_1} />
          <View style={styles.tableCell_2} />
          <View style={styles.tableCell_3} />
          <View style={styles.tableCell_3}>
            <Text>Total Persons</Text>
          </View>
          <View style={[styles.tableCell_3, styles.alignRight]}>
            <Text>{invoice?.totalPersons}</Text>
          </View>
        </View>
        <View style={[styles.tableRow, styles.noBorder]}>
          <View style={styles.tableCell_1} />
          <View style={styles.tableCell_2} />
          <View style={styles.tableCell_3} />
          <View style={styles.tableCell_3}>
            <Text>Total Luggage</Text>
          </View>
          <View style={[styles.tableCell_3, styles.alignRight]}>
            <Text>{invoice?.totalLuggage}</Text>
          </View>
        </View>
        <View style={[styles.tableRow, styles.noBorder]}>
          <View style={styles.tableCell_1} />
          <View style={styles.tableCell_2} />
          <View style={styles.tableCell_3} />
          <View style={styles.tableCell_3}>
            <Text style={styles.h4}>Total</Text>
          </View>
          <View style={[styles.tableCell_3, styles.alignRight]}>
            <Text style={styles.h4}>{fCurrency(invoice?.totalBill)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
