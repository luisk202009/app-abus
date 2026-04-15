import { User, Home, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentStatusCard } from "./DocumentStatusCard";
import { DocumentComments } from "./DocumentComments";
import type { DocumentStatus, DocumentType, DocumentCategory as CategoryType } from "@/lib/documentConfig";

interface UserDocument {
  id: string;
  document_type: string;
  status: DocumentStatus;
  file_name: string | null;
  validation_message: string | null;
}

interface DocumentCategoryProps {
  category: CategoryType;
  title: string;
  documents: DocumentType[];
  userDocuments: UserDocument[];
  onUpload: (documentType: string, file: File) => void;
  onDelete: (documentId: string) => void;
  isUploading: boolean;
  isPremium: boolean;
  onPremiumRequired: () => void;
}

const categoryIcons: Record<CategoryType, React.ElementType> = {
  identidad: User,
  residencia: Home,
  antecedentes: Shield,
  identidad_permanente: ShieldCheck,
};

export const DocumentCategory = ({
  category,
  title,
  documents,
  userDocuments,
  onUpload,
  onDelete,
  isUploading,
  isPremium,
  onPremiumRequired,
}: DocumentCategoryProps) => {
  const Icon = categoryIcons[category];

  // Get user document for a specific document type
  const getUserDocument = (type: string): UserDocument | undefined => {
    return userDocuments.find((d) => d.document_type === type);
  };

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>

      {/* Document Cards */}
      <div className="space-y-3">
        {documents.map((doc) => {
          const userDoc = getUserDocument(doc.type);
          return (
            <div key={doc.type}>
              <DocumentStatusCard
                document={doc}
                status={(userDoc?.status as DocumentStatus) || "waiting"}
                fileName={userDoc?.file_name}
                fileUrl={userDoc?.file_url}
                validationMessage={userDoc?.validation_message}
                onUpload={(file) => onUpload(doc.type, file)}
                onDelete={userDoc ? () => onDelete(userDoc.id) : undefined}
                isUploading={isUploading}
                isPremium={isPremium}
                onPremiumRequired={onPremiumRequired}
              />
              {userDoc && <DocumentComments documentId={userDoc.id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
