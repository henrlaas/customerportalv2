
// Inside the FilterContract function, update to handle 'all' value:
  const filteredContracts = contracts.filter((contract: any) => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
