import { useState } from 'react';
import { EmailProvider, useEmail } from './contexts/EmailContext';
import EmailInput from './components/EmailInput';
import ReportConfigForm from './components/ReportConfigForm';
import ReportsList from './components/ReportsList';

type View = 'form' | 'list';

function AppContent() {
  const { email, setEmail } = useEmail();
  const [currentView, setCurrentView] = useState<View>('form');
  const [editingReportId, setEditingReportId] = useState<string | null>(null);

  if (!email) {
    return <EmailInput onEmailSubmit={setEmail} />;
  }

  const handleEditReport = (reportId: string) => {
    setEditingReportId(reportId);
    setCurrentView('form');
  };

  const handleBackToForm = () => {
    setEditingReportId(null);
    setCurrentView('form');
  };

  const handleViewReports = () => {
    setCurrentView('list');
  };

  return currentView === 'form' ? (
    <ReportConfigForm
      onViewReports={handleViewReports}
      editingReportId={editingReportId}
      onClearEdit={() => setEditingReportId(null)}
    />
  ) : (
    <ReportsList
      onBackToForm={handleBackToForm}
      onEditReport={handleEditReport}
    />
  );
}

function App() {
  return (
    <EmailProvider>
      <AppContent />
    </EmailProvider>
  );
}

export default App;
