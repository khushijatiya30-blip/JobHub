package com.placement.dto;
public class DashboardStats {
    private long totalStudents,placedStudents,totalCompanies,approvedCompanies;
    private long totalJobs,activeJobs,totalApplications,selectedApplications;
    public DashboardStats() {}
    public long getTotalStudents(){return totalStudents;} public void setTotalStudents(long v){totalStudents=v;}
    public long getPlacedStudents(){return placedStudents;} public void setPlacedStudents(long v){placedStudents=v;}
    public long getTotalCompanies(){return totalCompanies;} public void setTotalCompanies(long v){totalCompanies=v;}
    public long getApprovedCompanies(){return approvedCompanies;} public void setApprovedCompanies(long v){approvedCompanies=v;}
    public long getTotalJobs(){return totalJobs;} public void setTotalJobs(long v){totalJobs=v;}
    public long getActiveJobs(){return activeJobs;} public void setActiveJobs(long v){activeJobs=v;}
    public long getTotalApplications(){return totalApplications;} public void setTotalApplications(long v){totalApplications=v;}
    public long getSelectedApplications(){return selectedApplications;} public void setSelectedApplications(long v){selectedApplications=v;}
    public static Builder builder(){return new Builder();}
    public static class Builder {
        private long totalStudents,placedStudents,totalCompanies,approvedCompanies;
        private long totalJobs,activeJobs,totalApplications,selectedApplications;
        public Builder totalStudents(long v){totalStudents=v;return this;}
        public Builder placedStudents(long v){placedStudents=v;return this;}
        public Builder totalCompanies(long v){totalCompanies=v;return this;}
        public Builder approvedCompanies(long v){approvedCompanies=v;return this;}
        public Builder totalJobs(long v){totalJobs=v;return this;}
        public Builder activeJobs(long v){activeJobs=v;return this;}
        public Builder totalApplications(long v){totalApplications=v;return this;}
        public Builder selectedApplications(long v){selectedApplications=v;return this;}
        public DashboardStats build(){
            DashboardStats d=new DashboardStats();
            d.totalStudents=totalStudents;d.placedStudents=placedStudents;
            d.totalCompanies=totalCompanies;d.approvedCompanies=approvedCompanies;
            d.totalJobs=totalJobs;d.activeJobs=activeJobs;
            d.totalApplications=totalApplications;d.selectedApplications=selectedApplications;
            return d;
        }
    }
}
