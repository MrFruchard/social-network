export async function sendMessage(receiverId, content, imageFile, conversationId) {
  try {
    const formData = new FormData();

    // Add required fields
    formData.append('receiver', receiverId);
    formData.append('content', content || '');

    // Add optional fields
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }
    if (conversationId) {
      formData.append('conversationId', conversationId);
    }

    const requestOptions = {
      method: 'POST',
      body: formData,
      redirect: 'follow',
    };

    const response = await fetch('/api/message', requestOptions);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
