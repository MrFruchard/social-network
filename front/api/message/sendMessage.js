export async function sendMessage(receiverId, content, imageFile, conversationId) {
  console.log('sendMessage arguments:', {
    receiverId,
    content,
    imageFile,
    conversationId,
  });
  try {
    const formData = new FormData();
    if (Array.isArray(receiverId)) {
      receiverId.forEach((r) => formData.append('receiver', r));
    } else {
      formData.append('receiver', receiverId);
    }
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name[0]);
    } else if (content) {
      formData.append('content', content);
    }
    if (conversationId && !conversationId.startsWith('temp-')) {
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
