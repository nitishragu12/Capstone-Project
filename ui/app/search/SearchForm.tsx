"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Switch,
  FormControlLabel,
  Paper,
  TextField,
  Button,
  Autocomplete,
  Chip,
  Alert
} from "@mui/material";
import { searchPapers, getTotalCount } from "../actions";
import Loading from "../components/Loading";

interface SearchFormData {
  query: string;
  fromDate: string;
  toDate: string;
  title: string;
  author: string;
  publications: string[]; // Field for publications
  advanced: boolean;
  chat: boolean;
  geminiPro: boolean;
}

const SearchForm: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<SearchFormData>({
    query: "Crash",
    fromDate: "01-01-2021",
    toDate: "31-01-2022",
    title: "",
    author: "",
    publications: [],
    advanced: true,
    chat: false,
    geminiPro: false,
  });

  const [resultCount, setResultCount] = useState<number | null>(null); // State for result count

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");

  const isValidDate = (dateString: string):boolean => {
    // Check if the date matches the format dd-mm-yyyy
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(dateString)) return false;

    const [day, month, year] = dateString.split("-").map(Number);
    
    const date = new Date(year, month - 1, day);
    return (
      date &&
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  };
  const isValidData = ():boolean => {
    if (!formData.query.trim()) {
      setError("Query field is required.");
      return false;
    }
    if (formData.advanced) {
      if (!isValidDate(formData.fromDate) || !isValidDate(formData.toDate)) {
        setError("Please enter valid dates in the format dd-mm-yyyy.");
        return false;
      }
      const fromDate = new Date(formData.fromDate.split("-").reverse().join("-")).getTime();
      const toDate = new Date(formData.toDate.split("-").reverse().join("-")).getTime();
      
      if (fromDate > toDate) {
        setError("From Date should not be later than To Date.");
        return false;
      }
      // if (!formData.title.trim() && !formData.author.trim()) {
      //   setError(
      //     "Either Title or Author must be filled for an advanced search."
      //   );
      //   return;
      // }

      // Length and character restrictions
      if (formData.title.length > 100) {
        setError("Title should not exceed 100 characters.");
        return false;
      }

      if (!/^[a-zA-Z\s]*$/.test(formData.author)) {
        setError("Author name should contain only letters and spaces.");
        return false;
      }
    }
    return true;
  };

  const handleSearchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (!isValidData()) return;
    setError("");
  
    setLoading(true);
  
    const params = new URLSearchParams();
    params.append("query", formData.query);
    params.append("publications", formData.publications.join(","));
    if (formData.advanced) {
      params.append("fromDate", formData.fromDate);
      params.append("toDate", formData.toDate);
      params.append("title", formData.title);
      params.append("author", formData.author);
    }
  
    try {
      // Fetch total count
      const countResponse = await getTotalCount(params.toString());
      setResultCount(countResponse.data.total_count);
      
    } catch (error) {
      console.error("Error:", error);
      setResultCount(0); // Set to 0 if there's an error
    } finally {
      setLoading(false);
    }
  };
  
  const handleProceedSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Any additional logic for "Proceed" can be handled here
    router.push("/results");
  };
  
  const handleInputChange =
    (key: keyof SearchFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [key]: event.target.value });
    };

  const handlePublicationChange = (event: any, value: string[]) => {
    setFormData({ ...formData, publications: value });
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <form >
            <Grid container spacing={2}>
              <Grid
                xs={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
                  sx={{ marginRight: 2 }}
                />
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
              </Grid>

              <Grid xs={6}>
                <TextField
                  label="Query"
                  fullWidth
                  value={formData.query}
                  onChange={handleInputChange("query")}
                />
              </Grid>
              <Grid xs={6}>
                <Autocomplete
                  multiple
                  options={[
                    "Accident Analysis and Prevention",
                    "Journal of Safety Research",
                    "Transportation Research Part F",
                    "Journal of Road Engineering",
                  ]} // Updated publication options
                  value={formData.publications}
                  onChange={handlePublicationChange}
                  renderTags={(value: string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Publication"
                      placeholder="Select journals"
                    />
                  )}
                />
              </Grid>

              {formData.advanced && (
                <>
                  <Grid xs={6}>
                    <TextField
                      label="From Date (dd-mm-yyyy)"
                      fullWidth
                      value={formData.fromDate}
                      onChange={handleInputChange("fromDate")}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      label="To Date (dd-mm-yyyy)"
                      fullWidth
                      value={formData.toDate}
                      onChange={handleInputChange("toDate")}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      label="Title"
                      fullWidth
                      value={formData.title}
                      onChange={handleInputChange("title")}
                    />
                  </Grid>
                  <Grid xs={6}>
                    <TextField
                      label="Author"
                      fullWidth
                      value={formData.author}
                      onChange={handleInputChange("author")}
                    />
                  </Grid>
                </>
              )}

              <Grid xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                <Button type="submit" variant="contained" color="primary" onClick={handleSearchSubmit}>
                  Search
                </Button>
                <Button 
                  variant="contained"
                  color="secondary"
                  sx={{ marginLeft: 2 }}
                  onClick={handleProceedSubmit}

                >
                  Proceed
                </Button>
              </Grid>

              {resultCount !== null && (
                <Grid
                xs={12}
                sx={{
                    display: "flex",
                   justifyContent: "center",
                    marginTop: 2,
                }}
                >
              <Paper sx={{ padding: 2, display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: 5 }}>🔍</span>
                <span>Total Results: {resultCount}</span> {/* 更新这里显示总数量 */}
    </Paper>
  </Grid>
)}


            </Grid>
          </form>
        </Paper>
      )}
    </>
  );
};

export default SearchForm;
