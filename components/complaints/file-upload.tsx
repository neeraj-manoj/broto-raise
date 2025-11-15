'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface FileUploadProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSizeMB?: number
}

export function FileUpload({ files, onFilesChange, maxFiles = 5, maxSizeMB = 10 }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5" />
    if (type.includes('pdf')) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024
    const oversizedFiles = selectedFiles.filter(f => f.size > maxSizeBytes)
    if (oversizedFiles.length > 0) {
      toast.error(`Files must be smaller than ${maxSizeMB}MB`)
      return
    }

    setIsUploading(true)
    const uploadedFiles: UploadedFile[] = []

    try {
      for (const file of selectedFiles) {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `complaints/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('complaint-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {

          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('complaint-attachments')
          .getPublicUrl(filePath)

        uploadedFiles.push({
          id: data.path,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl
        })
      }

      onFilesChange([...files, ...uploadedFiles])
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`)
    } catch (error) {

      toast.error('Failed to upload files')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = async (fileToRemove: UploadedFile) => {
    try {
      // Delete from storage
      const { error } = await supabase.storage
        .from('complaint-attachments')
        .remove([fileToRemove.id])

      if (error) {

        toast.error('Failed to delete file')
        return
      }

      onFilesChange(files.filter(f => f.id !== fileToRemove.id))
      toast.success('File removed')
    } catch (error) {

      toast.error('Failed to delete file')
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || files.length >= maxFiles}
          aria-label="Upload files"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || files.length >= maxFiles}
          className="w-full border-dashed border-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-24"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              <div className="text-center">
                <div className="font-medium">Click to upload files</div>
                <div className="text-xs text-gray-400 mt-1">
                  Images, PDF, DOC (Max {maxSizeMB}MB, {maxFiles} files)
                </div>
              </div>
            </>
          )}
        </Button>

        {files.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            {files.length} / {maxFiles} files uploaded
          </p>
        )}
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between bg-white/5 rounded-lg border border-white/10 p-3 group hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-blue-400">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(file)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
