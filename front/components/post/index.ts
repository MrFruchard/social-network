// Fichier d'export centralisant tous les composants liés aux posts

export * from './PostContainer';
export * from './CreatePost';
export * from './ViewPost';
export * from './CommentSection';
export * from './ImageUpload';

// Alias pour la compatibilité avec les noms précédents
export { CreatePost as PostModal } from './CreatePost';
export { ViewPost as PostDetail } from './ViewPost';