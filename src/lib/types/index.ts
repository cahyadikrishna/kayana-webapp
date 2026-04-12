export interface GoogleDriveFile {
	id: string;
	name: string;
	mimeType: string;
	webViewLink: string;
	thumbnailLink?: string;
	modifiedTime?: string;
	size?: string;
}

export interface Session {
	id: string;
	name: string;
	drive_folder_id: string;
	drive_folder_url: string;
	created_at: string;
}

export interface Selection {
	file_id: string;
	file_name: string;
	mimeType: string;
}

export interface SubmissionData {
	sessionId: string;
	selectedFiles: Selection[];
}

export interface SubmissionRecord {
	id: string;
	session_id: string;
	selected_files: Selection[];
	submitted_at: string;
}

export interface AdminSession extends Session {
	submission_count: number;
}
