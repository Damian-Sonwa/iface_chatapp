import Sidebar from './Sidebar';

const SideShell = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <Sidebar
        rooms={[]}
        privateChats={[]}
        users={[]}
        activeChat={null}
        chatType={null}
        onChatSelect={()=>{}}
        onStartChat={()=>{}}
        onCreateRoom={()=>{}}
        onOpenPanel={()=>{}}
        activePanel={null}
        friendRequestsCount={0}
        invitesCount={0}
      />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default SideShell;







