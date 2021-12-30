function mySettings(props) {
  return (
    <Page>
        <Section title={<Text bold align="center">ToDo Settings</Text>}>
            <TextInput
              settingsKey="clientId"
              label="Client ID"
            />
            <TextInput
              settingsKey="clientSecret"
              label="Client Secret"
            />
            <TextInput
              settingsKey="refreshToken"
              label="Refresh Token"
            />
            <TextInput
              settingsKey="listId"
              label="List ID"
            />
          </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
