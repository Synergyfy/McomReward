import { Business } from '../../../services/business/types';
const BusinessDashboardLayout = ({ children }: { children: React.ReactNode }) => {
    



    return <>
        <div className="bg-gray-50 p-4 border-b border-gray-300 flex  flex-row items-center justify-between">
    
  

    <aside className="w-64 bg-gray-100 p-4 border-r border-gray-300 top-0 left-0 h-screen fixed">
        <h2 className="text-2xl font-bold mb-6 text-orange-500">Business Menu</h2>
                <nav className="flex flex-col gap-4">
            
                    <a href="/business/dashboard" className="text-gray-700 hover:text-white">
                        <div className=" mb-1 hover:bg-orange-500 rounded-2xl p-2">
                            Dashboard
                        </div>
                    </a>

                    <a href="/business/dashboard/campaigns" className="text-gray-700 hover:text-white">
                        <div className=" mb-1 hover:bg-orange-500 rounded-2xl p-2">
                            Campaigns
                        </div>
                    </a>
            <a href="/business/dashboard/performance" className="text-gray-700 hover:text-white">
                <div className=" mb-1 hover:bg-orange-500 rounded-2xl p-2">
                   Something
                </div>
            </a>
            <a href="/business/dashboard/settings" className="text-gray-700 hover:text-white">
                <div className=" mb-1 hover:bg-orange-500 rounded-2xl p-2">
                    some other thing
                </div>
            </a>
        </nav>
    </aside>


        <main className="flex-1 justify-center ml-64 p-6">
            {children}
            </main>
    </div>
    </>;
};
export default BusinessDashboardLayout;
