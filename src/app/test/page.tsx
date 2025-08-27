'use client';


// Disable static generation for this page
export const dynamic = 'force-dynamic';export default function TestPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-8">🎉 GlassWallet Test Page</h1>
        
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">✅ Server is Working!</h2>
          <p className="text-gray-300 mb-6">
            The development server is running successfully without Clerk authentication errors.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <h3 className="text-green-300 font-semibold mb-2">✅ What's Working</h3>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• Next.js 15.5 with Turbopack</li>
                <li>• Glassmorphic styling</li>
                <li>• TypeScript compilation</li>
                <li>• No authentication errors</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
              <h3 className="text-blue-300 font-semibold mb-2">🚀 Available Features</h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Lead Management System</li>
                <li>• Credit Score Integration</li>
                <li>• Analytics Dashboard</li>
                <li>• Component Library</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Navigate to:</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="/leads" 
                className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 px-4 py-2 rounded transition-colors"
              >
                Lead Management
              </a>
              <a 
                href="/components-demo" 
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded transition-colors"
              >
                Component Demo
              </a>
              <a 
                href="/leads/new" 
                className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 px-4 py-2 rounded transition-colors"
              >
                Add New Lead
              </a>
              <a 
                href="/leads/analytics" 
                className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded transition-colors"
              >
                Analytics
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🔧 Development Info</h3>
          <p className="text-gray-400 text-sm">
            Mock authentication is active. All protected routes are accessible without login.
            <br />
            Current mock user: <span className="text-green-400">John Doe (john.doe@example.com)</span>
          </p>
        </div>
      </div>
    </div>
  );
}