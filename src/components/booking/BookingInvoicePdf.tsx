import { useMemo } from "react";
import {
  Page,
  View,
  Text,
  Image,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

import { IBookingType } from "@/types/type";
import { fDate } from "@/lib/format-time";
import { formatDistance, formatDuration, formattedPrice } from "@/lib/utils";

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
        mb60: { marginBottom: 60 },
        h3: { fontSize: 16, fontWeight: 700 },
        h4: { fontSize: 13, fontWeight: 700 },
        body1: { fontSize: 10 },
        body2: { fontSize: 9 },
        subtitle1: { fontSize: 10, fontWeight: 700 },
        subtitle2: { fontSize: 9, fontWeight: 700 },
        alignRight: { textAlign: "right" },
        page: {
          fontSize: 12,
          lineHeight: 1.6,
          fontFamily: "Helvetica",
          backgroundColor: "#FFFFFF",
          textTransform: "capitalize",
          padding: "48px 36px 60px 48px",
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

export default function InvoicePDF({ invoice }: { invoice: IBookingType }) {
  const {
    id,
    status,
    riderInfo,
    driverInfo,
    bookingDate,
    bookingTime,
    requestInfo,
  } = invoice || {};

  const styles = useStyles();
  const logoSrc =
    typeof window !== "undefined"
      ? `${window.location.origin}/assets/logo.png`
      : undefined;
  

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.gridContainer, styles.mb60]}>
          {logoSrc ? <Image src={logoSrc} style={{ width: 48, height: 48 }} /> : <View />}

          <View style={{ alignItems: "flex-end", flexDirection: "column" }}>
            <Text style={[styles.h3, { marginBottom: 8 }]}>{status}</Text>
            <Text>Booking ID: {id} </Text>
          </View>
        </View>

        <View style={[styles.gridContainer, styles.mb40]}>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Invoice TO:</Text>
            <Text style={styles.body2}>{riderInfo?.firstName}</Text>
            <Text style={styles.body2}>{riderInfo?.emailAddress}</Text>
            <Text style={styles.body2}>{riderInfo?.phone_number}</Text>
          </View>

          <View
            style={[
              styles.col6,
              { alignItems: "flex-end", flexDirection: "column" },
            ]}
          >
            <Text style={[styles.subtitle2, styles.mb4]}>Invoice FROM</Text>
            <Text style={styles.body2}>{driverInfo?.userInfo?.firstName}</Text>
            <Text style={styles.body2}>
              {driverInfo?.selfAssessmentTaxId ||
                driverInfo?.nationalInsuranceNumber}
            </Text>
            <Text style={styles.body2}>info@real-support.co.uk</Text>
            <Text style={styles.body2}>07769372911</Text>
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
            <Text style={styles.body2}>
              {formatDuration(invoice?.totalDuration)}
            </Text>
          </View>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Total Distance</Text>
            <Text style={styles.body2}>
              {formatDistance(invoice?.totalDistance)}
            </Text>
          </View>
        </View>

        <View style={[styles.gridContainer, styles.mb40]}>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Start Form:</Text>
            <Text style={styles.body2}>{invoice?.startFrom?.name}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Destination:</Text>
            <Text style={styles.body2}>{invoice?.destination?.name || invoice?.destination?.description}</Text>
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
            <Text>{formattedPrice(requestInfo?.discountAmount || 0)}</Text>
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
            <Text>{invoice?.totalPersons || 1}</Text>
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
            <Text>{invoice?.totalLuggage || 0}</Text>
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
            <Text style={styles.h4}>
              {formattedPrice(invoice?.totalBill || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.body2}>One App • support@real-support.com • +44 20 7946 0958</Text>
        </View>
      </Page>
    </Document>
  );
}
