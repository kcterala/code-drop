import ky from 'ky';

export const getPong = async () => {
    const response = await ky.get('/ping');
    return response;
}

export const getSubmissionOutput = async (submission) => {
    const response = await ky.post('https://api.kcterala.in/hello', {
        json: {
            ...submission
        }
    })
    return response;
}