import React, { useEffect, useState } from 'react';
import { Box, H2, H4, Text, Button, Loader, Table, TableRow, TableCell } from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

const api = new ApiClient();

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await api.getDashboard();
        if (!mounted) return;
        setData(response?.data || null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load dashboard');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box variant="grey" padding="xl">
        <Loader />
      </Box>
    );
  }

  if (error) {
    return (
      <Box variant="danger" padding="xl">
        <H4>Dashboard error</H4>
        <Text>{error}</Text>
      </Box>
    );
  }

  const role = data?.currentAdmin?.role;

  return (
    <Box padding="xl">
      <Box flex justifyContent="space-between" alignItems="center" mb="xl">
        <H2>ECommerce Dashboard</H2>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </Box>

      {role === 'admin' ? (
        <>
          <Box flex flexDirection={['column', 'row']} gap="lg" mb="xl">
            <Stat title="Total users" value={data?.stats?.users ?? 0} />
            <Stat title="Total orders" value={data?.stats?.orders ?? 0} />
            <Stat title="Revenue" value={`$${data?.stats?.revenue ?? '0.00'}`} />
          </Box>

          <Box variant="white" padding="lg">
            <H4>Recent orders</H4>
            <OrdersTable rows={data?.recentOrders || []} />
          </Box>
        </>
      ) : (
        <>
          <Box variant="white" padding="lg" mb="xl">
            <H4>Welcome</H4>
            <Text>Here are your latest orders.</Text>
          </Box>
          <Box variant="white" padding="lg">
            <H4>Your recent orders</H4>
            <OrdersTable rows={data?.recentOrders || []} />
          </Box>
        </>
      )}
    </Box>
  );
}

function Stat({ title, value }) {
  return (
    <Box variant="white" padding="lg" width={['100%', '33%']}>
      <Text fontWeight="bold" mb="sm">{title}</Text>
      <H2>{value}</H2>
    </Box>
  );
}

function OrdersTable({ rows }) {
  if (!rows?.length) {
    return <Text>No orders yet.</Text>;
  }
  return (
    <Table>
      <tbody>
        <TableRow>
          <TableCell><Text fontWeight="bold">Order ID</Text></TableCell>
          <TableCell><Text fontWeight="bold">Status</Text></TableCell>
          <TableCell><Text fontWeight="bold">Total</Text></TableCell>
          <TableCell><Text fontWeight="bold">Created</Text></TableCell>
        </TableRow>
        {rows.map((o) => (
          <TableRow key={o.id}>
            <TableCell>{o.id}</TableCell>
            <TableCell>{o.status}</TableCell>
            <TableCell>${o.totalAmount}</TableCell>
            <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

