import React, { useEffect, useState } from 'react';
import { Box, H2, H4, Text, Button, Input, Label, Loader, MessageBox } from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

const api = new ApiClient();

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.resourceAction({ resourceId: 'Setting', actionName: 'list' });
        const records = res?.data?.records || [];
        if (!mounted) return;
        setSettings(records.map((r) => ({ id: r.id, key: r.params.key, value: r.params.value, dataType: r.params.dataType })));
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load settings');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (idx, value) => {
    setSettings((prev) => prev.map((s, i) => (i === idx ? { ...s, value } : s)));
  };

  const onSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      await Promise.all(
        settings.map((s) =>
          api.resourceAction({
            resourceId: 'Setting',
            actionName: 'edit',
            recordId: s.id,
            data: { value: s.value, dataType: s.dataType, key: s.key },
          }),
        ),
      );
      setSuccess('Settings saved.');
    } catch (e) {
      setError(e?.message || 'Failed to save settings');
    }
  };

  if (loading) {
    return (
      <Box variant="grey" padding="xl">
        <Loader />
      </Box>
    );
  }

  return (
    <Box padding="xl">
      <H2>Settings</H2>
      <Text mb="lg">Update key-value settings for the application.</Text>

      {error && (
        <MessageBox variant="danger" mb="lg">
          <H4>Error</H4>
          <Text>{error}</Text>
        </MessageBox>
      )}
      {success && (
        <MessageBox variant="success" mb="lg">
          <Text>{success}</Text>
        </MessageBox>
      )}

      <Box variant="white" padding="lg">
        {settings.length === 0 ? (
          <Text>No settings found.</Text>
        ) : (
          settings.map((s, idx) => (
            <Box key={s.id} mb="lg">
              <Label>{s.key} ({s.dataType})</Label>
              <Input
                value={s.value ?? ''}
                onChange={(e) => onChange(idx, e.target.value)}
              />
            </Box>
          ))
        )}

        <Button variant="primary" onClick={onSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
}

