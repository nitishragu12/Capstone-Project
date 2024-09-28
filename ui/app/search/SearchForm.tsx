"use client";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Switch,
  Skeleton,
  FormControlLabel,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { searchPapers, getTotalCount } from "../actions";
import { useData } from "../context/DataContext";
import { useMessage } from "../context/MessageContext";
import { useLoading } from "../context/LoadingContext";
import styles from "./page.module.css"; // Importing the CSS for styling
import PublicationInput from "./PublicationInput";

const getSixMonthsAgo = (): string => {
  const today = new Date();
  today.setMonth(today.getMonth() - 6);
  return today.toISOString().slice(0, 7);
};

const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

interface SearchFormData {
  query: string;
  fromDate: string;
  toDate: string;
  title: string;
  author: string;
  publicationFile: File | null;
  advanced: boolean;
  chat: boolean;
  geminiPro: boolean;
}

const SearchForm: React.FC = () => {
  const [geminiPro, setGeminiPro] = useState<boolean>(false);
  const [formData, setFormData] = useState<SearchFormData>({
    query: "",
    fromDate: getSixMonthsAgo(),
    toDate: getCurrentMonth(),
    title: "",
    author: "",
    publicationFile: null,
    advanced: false,
    chat: false,
    geminiPro: geminiPro,
  });
  const [resultCount, setResultCount] = useState<number | null>(null);
  const { loading, setLoading } = useLoading();
  const { setMessage } = useMessage();
  const { data, setData } = useData();

  // Clear session when first mounted
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    setGeminiPro(formData.geminiPro);
    sessionStorage.setItem("switchModel", String(formData.geminiPro));
  }, [formData.geminiPro]);

  const isValidMonthYear = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const [year, month] = dateString.split("-").map(Number);
    return year >= 1900 && month >= 1 && month <= 12;
  };
  

  const isValidData = (): boolean => {

    const specialCharRegex = /^[a-zA-Z0-9\s\-_'"*]*$/;  // Allow letters, numbers, spaces, dashes, underscores, single and double quotes

    if (!formData.query.trim()) {
      setMessage("Query field is required.", "error");
      return false;
    }
    // Validate query field for special characters
    if (!specialCharRegex.test(formData.query)) {
      setMessage("Query field contains invalid special characters.", "error");
      return false;
    }
    
    if (formData.advanced) {
      if (
        !isValidMonthYear(formData.fromDate) ||
        !isValidMonthYear(formData.toDate)
      ) {
        setMessage("Please enter valid months and years in the format yyyy-mm.", "error");
        return false;
      }
      const fromDate = new Date(`${formData.fromDate}-01`).getTime();
      const toDate = new Date(`${formData.toDate}-01`).getTime();
      if (fromDate > toDate) {
        setMessage("From Date should not be later than To Date.", "error");
        return false;
      }
      if (formData.title.length > 100) {
        setMessage("Title should not exceed 100 characters.", "error");
        return false;
      }
      // Validate title field for special characters
      if (!specialCharRegex.test(formData.title)) {
        setMessage("Title contains invalid special characters.", "error");
        return false;
      }
      if (!/^[a-zA-Z\s]*$/.test(formData.author)) {
        setMessage("Author name should contain only letters and spaces.", "error");
        return false;
      }
    }
    return true;
  };

  const buildQuery = (): string => {
    const params = new URLSearchParams();
    params.append("query", formData.query);
    params.append("model", String(geminiPro));
    sessionStorage.setItem("switchModel", String(geminiPro));
    if (formData.advanced) {
      params.append("fromDate", formData.fromDate);
      params.append("toDate", formData.toDate);
      params.append("title", formData.title);
      params.append("author", formData.author);
    }
    return params.toString();
  };

  const handleSearch = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isValidData()) return;
    setMessage(null); // Clear any previous error messages
    setLoading(true);
  
    // Construct query
    const query = buildQuery();
    getTotalCount(query)
      .then((response) => {
        setResultCount(response.data.total_count);
      })
      .catch((error) => {
        console.error("Error:", error);
        setResultCount(0);
        setMessage(`${error.response.data.message}`, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleProceedSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!isValidData()) return;
    setMessage(null); // Clear any previous error messages
    setLoading(true, "search-progress"); // Show loading indicator

    const query = buildQuery();
    // Reset data and chatId when proceeding
    setData(null);
    sessionStorage.removeItem("chatId");
    // Get search results
    searchPapers(query)
      .then((response) => {
        const papers = response.data;
        setData(papers);
        setMessage(`${papers.length} papers loaded.`, "success");
      })
      .catch((error) => {
        setMessage(`${error.response.data.message}`, "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange = (key: keyof SearchFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [key]: event.target.value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedTypes = ["text/csv"];
      if (allowedTypes.includes(file.type)) {
        setFormData({ ...formData, publicationFile: file });
      } else {
        setMessage("Please upload a valid CSV file.", "error");
        setFormData({ ...formData, publicationFile: null });
      }

    }
  };

  return (
    <>
      <Paper elevation={3} className={styles.paper}>
        <h1 className={styles.header}>Literature Paper Search</h1>
        <Grid container spacing={2}>
          {/* Toggle switches */}
          <Grid xs={12} className={styles["switch-container"]}>
            {loading ? (
              <Skeleton width={200} height={40} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.advanced}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        advanced: !prev.advanced,
                      }))
                    }
                  />
                }
                label="Advanced Search"
              />
            )}

            {formData.advanced && !loading && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.geminiPro}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        geminiPro: !prev.geminiPro,
                      }))
                    }
                  />
                }
                label="Gemini 1.5 Pro"
              />
            )}
          </Grid>

          {/* Query input */}
          <Grid xs={12} md={formData.advanced ? 6 : 12}>
            {loading ? (
              <Skeleton width="100%" height={56} />
            ) : (
              <TextField
                label="Query"
                variant="filled"
                fullWidth
                className={styles.textField}
                value={formData.query}
                onChange={handleInputChange("query")}
              />
            )}
          </Grid>

          {/* Advanced fields */}
          {formData.advanced && (
            <>
              <Grid xs={12} md={6} className={styles["date-container"]}>
                {loading ? (
                  <Skeleton width="100%" height={56} />
                ) : (
                  <>
                    <TextField
                      label="From Date"
                      variant="filled"
                      type="month"
                      fullWidth
                      className={styles.dateField} // Applying dateField class
                      value={formData.fromDate}
                      onChange={handleInputChange("fromDate")}
                    />
                    <TextField
                      label="To Date"
                      variant="filled"
                      type="month"
                      fullWidth
                      className={styles.dateField} // Applying dateField class
                      value={formData.toDate}
                      onChange={handleInputChange("toDate")}
                    />
                  </>
                )}
              </Grid>

              <Grid xs={12} md={6}>
                {loading ? (
                  <Skeleton width="100%" height={56} />
                ) : (
                  <TextField
                    label="Title"
                    variant="filled"
                    fullWidth
                    className={styles.textField}
                    value={formData.title}
                    onChange={handleInputChange("title")}
                  />
                )}
              </Grid>

              <Grid xs={12} md={6}>
                {loading ? (
                  <Skeleton width="100%" height={56} />
                ) : (
                  <TextField
                    label="Author"
                    variant="filled"
                    fullWidth
                    className={styles.textField}
                    value={formData.author}
                    onChange={handleInputChange("author")}
                  />
                )}
              </Grid>

              {/* File upload */}
              <Grid xs={12} className={styles["fileInput-container"]}>
                {loading ? (
                  <Skeleton width="100%" height={56} />
                ) : (
                  <PublicationInput onChange={handleFileChange} className={styles.fileInput}/>
                )}
              </Grid>
            </>
          )}

          {/* Result count display */}
          {resultCount !== null && (
            <Grid xs={12} className={styles.resultCount}>
              <Paper elevation={0} className={styles.resultCountPaper}>
                <span className={styles.resultCountText}>Total Results: {resultCount}</span>
              </Paper>
            </Grid>
          )}


          {/* Action buttons with custom CSS */}
          <Grid xs={12} className={styles["button-container"]}>
            <div className={styles["button-group"]}>
              <Button
                type="submit"
                className={styles.button}
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>

              <Button
                className={styles.button}
                onClick={handleProceedSubmit}
                disabled={loading}
              >
                Proceed
              </Button>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default SearchForm;
