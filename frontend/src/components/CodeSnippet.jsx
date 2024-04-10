import React, { useState } from 'react';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/ext-language_tools";
import { getSubmissionOutput } from '../apis/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const CodeSnippet = () => {
    const placeholderCode = {
        JS: "function main() {\n   console.log('hello')\n}\n\nmain()",
        JAVA: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, world!\");\n    }\n}",
        GO: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, world!\")\n}",
        PYTHON: "def main():\n    print(\"Hello, world!\")\n\nif __name__ == \"__main__\":\n    main()\n"
    };

    const [submission, setSubmission] = useState({
        language: "JS",
        code: placeholderCode['JS']
    });

    const [output, setOutput] = useState();
    const [loading, setLoading] = useState(false);

    const handleLanguageChange = (e) => {
        const selectedLanguage = e.target.value;
        setSubmission({
            ...submission,
            language: selectedLanguage,
            code: placeholderCode[selectedLanguage]
        });
        setOutput("")
    };

    const handleCodeChange = (newCode) => {
        setSubmission({
            ...submission,
            code: newCode
        });
    };

    const getSubmissionFromServer = async () => {
        setLoading(true);
        const response = await getSubmissionOutput(submission);
        const data = await response.text();
        setOutput(data);
        setLoading(false);
    };

    const commands = [{
        name: 'saveFile',
        bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
        exec: function(editor) {
            console.log('File saved');
        }
    }];

    return (
        <div className='px-44'>
            <div className='flex justify-between'>
                <div>
                    <select
                        id='language'
                        name='language'
                        className='border-2 border-neutral-800 rounded-lg bg-gray-700 text-white px-2 py-2 mb-5 font-mono'
                        onChange={handleLanguageChange}
                        value={submission.language}
                        disabled={loading}
                    >
                        <option value="JS">JavaScript</option>
                        <option value="JAVA">Java</option>
                        <option value="PYTHON">Python</option>
                    </select>
                </div>
                <div className="relative">
                    <button 
                        className='py-2 px-3 rounded bg-green-600'
                        onClick={getSubmissionFromServer}
                        disabled={loading}
                    >
                        {loading && (
                            <FontAwesomeIcon icon={faSpinner} className='animate-spin'/>
                        )}
                        {!loading && "Run"}
                    </button>
                </div>
            </div>
            <div className='flex gap-10 justify-between'>
                <div className='flex flex-col gap-2 w-3/4'>
                    <label htmlFor="code" className='text-white text-xl'>Code</label>
                    <AceEditor
                        value={submission.code}
                        mode={submission.language.toLowerCase()}
                        width='auto'
                        theme="terminal"
                        fontSize="20px"
                        highlightActiveLine={true}
                        commands={commands}
                        setOptions={{
                            enableLiveAutocompletion: true,
                            showLineNumbers: true,
                            tabSize: 4
                        }}
                        onChange={handleCodeChange}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <label htmlFor="output" className='text-white text-xl'>Output</label>
                    <textarea name="output" 
                        id="output"
                        cols="60"
                        rows="10"
                        className='border-4 bg-black border-slate-600 rounded text-white font-mono p-2 hover:border-slate-500'
                        value={output}
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
};

export default CodeSnippet;
