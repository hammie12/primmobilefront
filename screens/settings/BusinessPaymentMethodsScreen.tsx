const handleConnectStripe = async () => {
  try {
    const { data, error } = await supabase
      .rpc('create_connect_account', {
        user_id: user.id
      });

    if (error) throw error;

    if (data?.url) {
      await Linking.openURL(data.url);
    }
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    Alert.alert('Error', 'Failed to start payment setup');
  }
}; 