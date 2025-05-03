
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// We'll just redirect to the tasks page with the task ID in the URL
export const TaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate(`/tasks/${taskId}`);
  }, [taskId, navigate]);
  
  return null;
};

export default TaskDetailPage;
