import React, { useState } from 'react'
import AceEditor from 'react-ace'
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github_dark"
import "ace-builds/src-noconflict/theme-terminal"
import "ace-builds/src-noconflict/ext-language_tools";
import { getPong, getSubmissionOutput } from '../apis/api';

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



    const handleLanguageChange = (e) => {
        const selectedLanguage = e.target.value;
        setSubmission({
            ...submission,
            language: selectedLanguage,
            code: placeholderCode[selectedLanguage]
        });
    };

    const handleCodeChange = (newCode) => {
        setSubmission({
            ...submission,
            code: newCode
        });
    };

    const getPongFromServer = async () => {
        setOutput("Processing")
        const response = await getSubmissionOutput(submission);
        const data = await response.text();
        setOutput(data)
    }

    const commands = [{
        name: 'saveFile',
        bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
        exec: function(editor) {
          console.log('File saved');
        }
      }];
    

    console.log(submission)
    console.log("output ", output)

    return (
        <div className='px-44'>
            <div className='flex justify-between'>
                <div>
                    <select
                        id='language'
                        name='language'
                        className='border-2 border-neutral-800 rounded-lg bg-gray-700 text-white px-2 py-2 mb-5'
                        onChange={handleLanguageChange}
                        value={submission.language} // Set value to submission.language
                    >
                        <option value="JS">JavaScript</option>
                        <option value="JAVA">Java</option>
                        <option value="GO">Go</option>
                        <option value="PYTHON">Python</option>
                    </select>
                </div>
                <div>
                    <button 
                        className='py-2 px-3 rounded bg-green-600'
                        onClick={getPongFromServer}
                    >
                        Run
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
                        className='border-2 bg-gray-700 border-slate-600 rounded text-white font-mono p-2'
                        value={output}
                        readOnly>
                    </textarea>
                </div>
            </div>
        </div>
    );
};

export default CodeSnippet;