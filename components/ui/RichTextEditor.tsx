"use client";
import React, { useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import with no SSR because Quill interacts with DOM
const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import("react-quill-new");
    return RQ;
}, {
    ssr: false,
    loading: () => <div className="h-64 w-full animate-pulse bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">Loading Editor...</div>
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    height?: string | number;
}

export function RichTextEditor({ value, onChange, placeholder, className, height = 300 }: RichTextEditorProps) {

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                [{ font: [] }],
                [{ size: ["small", false, "large", "huge"] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ script: "sub" }, { script: "super" }],
                ["blockquote", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                [{ direction: "rtl" }, { align: [] }],
                ["link", "image", "video"], 
                ["attachment"],
                ["clean"],
                ['undo', 'redo'],
            ],
            handlers: {
                undo: function() {
                    // @ts-ignore
                    const quill = this.quill;
                    if (quill.history) quill.history.undo();
                },
                redo: function() {
                    // @ts-ignore
                    const quill = this.quill;
                    if (quill.history) quill.history.redo();
                },
                attachment: function() {
                    // @ts-ignore
                    const quill = this.quill;
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.click();
                    input.onchange = () => {
                        const file = input.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const range = quill.getSelection();
                                quill.insertText(range.index, `📁 Attached: ${file.name}`, 'link', e.target?.result);
                            };
                            reader.readAsDataURL(file);
                        }
                    };
                }
            }
        },
        history: {
            delay: 1000,
            maxStack: 100,
            userOnly: true
        },
        clipboard: {
            matchVisual: false,
        }
    }), []);

    const formats = [
        "header", "font", "size",
        "bold", "italic", "underline", "strike", "blockquote",
        "list", "indent",
        "link", "image", "video", "color", "background",
        "align", "direction", "code-block", "script", "formula"
    ];

    // Add CSS for icons of Undo/Redo since they might be missing in default theme
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const styleId = "quill-custom-icons";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.innerHTML = `
                .ql-undo:after { content: '↶'; font-size: 18px; }
                .ql-redo:after { content: '↷'; font-size: 18px; }
                .ql-attachment:after { content: '📎'; font-size: 16px; }
                .ql-snow.ql-toolbar button:hover, .ql-snow .ql-toolbar button:hover {
                    color: #4f46e5 !important;
                }
                .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:hover .ql-stroke {
                    stroke: #4f46e5 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div className={`rich-text-editor group transition-all ${className}`}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || "Start typing here..."}
            />
            <style jsx global>{`
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                    border-color: #e2e8f0;
                    background-color: #f8fafc;
                    padding: 8px 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .rich-text-editor .ql-container {
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                    border-color: #e2e8f0;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                    background-color: #fff;
                }
                .rich-text-editor .ql-editor {
                    min-height: ${typeof height === 'number' ? height + 'px' : height};
                    max-height: 600px;
                    line-height: 1.6;
                    color: #1e293b;
                    padding: 16px 20px;
                }
                .rich-text-editor table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 12px 0;
                }
                .rich-text-editor table td, .rich-text-editor table th {
                    border: 1px solid #e2e8f0;
                    padding: 8px 12px;
                    min-width: 50px;
                }
                .rich-text-editor table th {
                    background-color: #f8fafc;
                    font-weight: bold;
                }
                .rich-text-editor .ql-editor blockquote {
                    border-left: 4px solid #4f46e5;
                    background: #f5f3ff;
                    padding: 8px 16px;
                    border-radius: 4px;
                    color: #4338ca;
                    font-style: italic;
                }
                .rich-text-editor .ql-editor pre.ql-syntax {
                    background-color: #1e293b;
                    color: #f8fafc;
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    margin: 12px 0;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    color: #94a3b8;
                    font-style: normal;
                    left: 20px;
                }
                .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-label::before,
                .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-item::before {
                    content: attr(data-value);
                }
                .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
                .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
                    content: 'Small';
                }
                .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-label:not([data-value])::before,
                .rich-text-editor .ql-snow .ql-picker.ql-size .ql-picker-item:not([data-value])::before {
                    content: 'Normal';
                }

                /* ═══ Global Rich Content Display Styles ═══ */
                .rich-content {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    line-height: 1.6;
                    color: #1e293b;
                }
                .rich-content strong, .rich-content b { font-weight: 800; color: #000; }
                .rich-content em, .rich-content i { font-style: italic; }
                .rich-content p { margin-bottom: 0.5em; }
                .rich-content h1 { font-size: 1.8em; font-weight: 800; margin-top: 1em; margin-bottom: 0.5em; }
                .rich-content h2 { font-size: 1.5em; font-weight: 700; margin-top: 0.8em; margin-bottom: 0.4em; }
                .rich-content h3 { font-size: 1.25em; font-weight: 600; margin-top: 0.6em; margin-bottom: 0.3em; }
                .rich-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
                .rich-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
                .rich-content li { margin-bottom: 0.25em; }
                .rich-content blockquote {
                    border-left: 4px solid #4f46e5;
                    background: #f5f3ff;
                    padding: 8px 16px;
                    border-radius: 4px;
                    color: #4338ca;
                    font-style: italic;
                    margin: 12px 0;
                }
                .rich-content pre {
                    background-color: #1e293b;
                    color: #f8fafc;
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-family: 'JetBrains Mono', monospace;
                    overflow-x: auto;
                    margin: 12px 0;
                }
                .rich-content img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
                .rich-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 12px 0;
                    border: 1px solid #e2e8f0;
                }
                .rich-content td, .rich-content th {
                    border: 1px solid #e2e8f0;
                    padding: 8px 12px;
                }
                .rich-content th { background-color: #f8fafc; }

                /* Quill Alignment Classes */
                .rich-content .ql-align-center { text-align: center; }
                .rich-content .ql-align-right { text-align: right; }
                .rich-content .ql-align-justify { text-align: justify; }
                
                .rich-content u { text-decoration: underline; }
                .rich-content s { text-decoration: line-through; }
                .rich-content sub { vertical-align: sub; font-size: smaller; }
                .rich-content sup { vertical-align: super; font-size: smaller; }
                
                /* Quill Font Sizes */
                .rich-content .ql-size-small { font-size: 0.75em; }
                .rich-content .ql-size-large { font-size: 1.25em; }
                .rich-content .ql-size-huge { font-size: 1.75em; }
                
                /* Quill Indents */
                .rich-content .ql-indent-1 { padding-left: 3em; }
                .rich-content .ql-indent-2 { padding-left: 6em; }
                .rich-content .ql-indent-3 { padding-left: 9em; }
            `}</style>
        </div>
    );
}
